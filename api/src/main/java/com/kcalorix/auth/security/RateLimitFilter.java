package com.kcalorix.auth.security;

import com.kcalorix.common.exception.ApiError;
import org.jspecify.annotations.NonNull;
import tools.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

public class RateLimitFilter extends OncePerRequestFilter {

    private static final String API = "/api/";
    private static final Set<String> WRITES = Set.of("POST", "PUT", "PATCH", "DELETE");

    private record Rule(String name, Set<String> methods, Predicate<String> path, boolean perUser,
                        int capacity, Duration period, Cache<String, Bucket> buckets) {}

    private final ObjectMapper mapper;
    private final List<Rule> rules;

    public RateLimitFilter(ObjectMapper mapper) {
        this.mapper = mapper;
        this.rules = List.of(
                rule("login", Set.of("POST"), p -> p.equals("/api/v1/auth/login"), false, 10, Duration.ofMinutes(1)),
                rule("register", Set.of("POST"), p -> p.equals("/api/v1/auth/register"), false, 5, Duration.ofHours(1)),
                rule("forgot", Set.of("POST"), p -> p.equals("/api/v1/auth/forgot-password"), false, 5, Duration.ofHours(1)),
                rule("reset", Set.of("POST"), p -> p.equals("/api/v1/auth/reset-password"), false, 10, Duration.ofHours(1)),
                rule("verify", Set.of("POST"), p -> p.equals("/api/v1/auth/verify-email"), false, 20, Duration.ofHours(1)),
                rule("api-ip", Set.of(), p -> p.startsWith(API), false, 300, Duration.ofMinutes(1)),
                rule("write-user", WRITES, p -> p.startsWith(API), true, 60, Duration.ofMinutes(1)),
                rule("delete-account", Set.of("DELETE"), p -> p.equals("/api/v1/me"), true, 5, Duration.ofHours(1)),
                rule("export", Set.of("GET"), p -> p.equals("/api/v1/me/export"), true, 3, Duration.ofHours(1)));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith(API);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod().toUpperCase();
        String ip = request.getRemoteAddr();
        String userId = currentUserId();

        for (Rule rule : rules) {
            if (!rule.methods().isEmpty() && !rule.methods().contains(method)) continue;
            if (!rule.path().test(path)) continue;

            String key;
            if (rule.perUser()) {
                if (userId == null) continue;
                key = "u:" + userId;
            } else {
                key = "ip:" + ip;
            }

            Bucket bucket = rule.buckets().get(key, k -> newBucket(rule.capacity(), rule.period()));
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
            if (!probe.isConsumed()) {
                long retryAfter = Math.max(1, (long) Math.ceil(probe.getNanosToWaitForRefill() / 1e9));
                reject(request, response, retryAfter);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CalorixUserDetails d) {
            return String.valueOf(d.getId());
        }
        return null;
    }

    private void reject(HttpServletRequest request, HttpServletResponse response,
                        long retryAfter) throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(retryAfter));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(),
                new ApiError(Instant.now(), 429, "TOO_MANY_REQUESTS",
                        "Too many attempts. Try again later.", request.getRequestURI(), null));
    }

    private static Rule rule(String name, Set<String> methods, Predicate<String> path, boolean perUser,
                             int capacity, Duration period) {
        Cache<String, Bucket> buckets = Caffeine.newBuilder()
                .maximumSize(100_000)
                .expireAfterAccess(period.multipliedBy(2))
                .build();
        return new Rule(name, methods, path, perUser, capacity, period, buckets);
    }

    private static Bucket newBucket(int capacity, Duration period) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(capacity)
                        .refillIntervally(capacity, period)
                        .build())
                .build();
    }
}