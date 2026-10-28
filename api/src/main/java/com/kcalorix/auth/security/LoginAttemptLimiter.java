package com.kcalorix.auth.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class LoginAttemptLimiter {

    private static final int MAX_FAILURES = 10;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .maximumSize(100_000)
            .expireAfterAccess(WINDOW)
            .build();

    public boolean isBlocked(String email) {
        return bucket(email).getAvailableTokens() == 0;
    }

    public void recordFailure(String email) {
        bucket(email).tryConsume(1);
    }

    public void reset(String email) {
        buckets.invalidate(key(email));
    }

    private Bucket bucket(String email) {
        return buckets.get(key(email), k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(MAX_FAILURES)
                        .refillIntervally(MAX_FAILURES, WINDOW)
                        .build())
                .build());
    }

    private String key(String email) {
        return email.trim().toLowerCase();
    }
}