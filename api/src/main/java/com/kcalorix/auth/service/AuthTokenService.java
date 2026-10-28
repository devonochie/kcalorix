package com.kcalorix.auth.service;

import com.kcalorix.auth.entity.AuthToken;
import com.kcalorix.auth.entity.enums.AuthTokenType;
import com.kcalorix.auth.repository.AuthTokenRepository;
import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthTokenService {

    private static final Logger log = LoggerFactory.getLogger(AuthTokenService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AuthTokenRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public String issue(UUID userId, AuthTokenType type, Duration ttl) {
        Instant now = Instant.now();
        repository.invalidateAll(userId, type, now); // only the newest link of each type works

        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        AuthToken token = new AuthToken();
        token.setUser(userRepository.getReferenceById(userId));
        token.setType(type);
        token.setTokenHash(sha256Hex(raw));
        token.setExpiresAt(now.plus(ttl));
        repository.save(token);

        return raw;
    }

    @Transactional
    public UUID consume(String raw, AuthTokenType type) {
        Instant now = Instant.now();
        AuthToken token = repository.findByTokenHashAndType(sha256Hex(raw.trim()), type)
                .orElseThrow(AuthTokenService::invalid);

        // same message for every failure, so nothing is revealed about why
        if (token.getUsedAt() != null
                || token.getExpiresAt().isBefore(now)
                || repository.markUsed(token.getId(), now) == 0) {
            throw invalid();
        }
        return token.getUser().getId();
    }

    public boolean recentlyIssued(UUID userId, AuthTokenType type) {
        return repository.existsByUserIdAndTypeAndCreatedAtAfter(
                userId, type, Instant.now().minusSeconds(60));
    }

    @Scheduled(cron = "0 45 3 * * *")
    @Transactional
    public void purgeExpired() {
        int deleted = repository.deleteExpiredBefore(Instant.now().minus(7, ChronoUnit.DAYS));
        log.info("Purged {} expired auth tokens", deleted);
    }

    private static BadRequestException invalid() {
        return new BadRequestException("This link is invalid or has expired");
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    public boolean dailyLimitReached(UUID userId, AuthTokenType type) {
        return repository.countByUserIdAndTypeAndCreatedAtAfter(
                userId, type, Instant.now().minus(24, ChronoUnit.HOURS)) >= 5;
    }
}