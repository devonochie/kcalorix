package com.kcalorix.usage.service;

import com.kcalorix.common.exception.TooManyRequestsException;
import com.kcalorix.usage.entity.UsageCounter;
import com.kcalorix.usage.repository.UsageCounterRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Database-backed usage caps for the two paid/limited APIs.
 * Counters live in the usage_counters table, so a restart does not reset them.
 */
@Service
public class UsageLimitService {

    // Gemini free tier: 15 per minute, 500 per day. App-wide caps keep a 20% margin.
    static final int PHOTO_PER_USER_PER_DAY = 3;
    static final int PHOTO_APP_PER_DAY = 400;
    static final int PHOTO_APP_PER_MINUTE = 12;

    // USDA: 1,000 per hour. App-wide cap keeps a 20% margin.
    static final int LOOKUP_PER_USER_PER_HOUR = 30;
    static final int LOOKUP_APP_PER_HOUR = 800;

    // Gemini resets its daily quota at midnight Pacific time
    private static final ZoneId PACIFIC = ZoneId.of("America/Los_Angeles");

    private static final String PHOTO_USER_MSG =
            "Daily photo limit reached (" + PHOTO_PER_USER_PER_DAY + " per day). Search the food by name instead";
    private static final String PHOTO_APP_MSG =
            "Photo scanning is busy right now. Search the food by name instead";
    private static final String LOOKUP_USER_MSG =
            "Food search limit reached (" + LOOKUP_PER_USER_PER_HOUR + " per hour). Try again later";
    private static final String LOOKUP_APP_MSG =
            "Food search is busy right now. Try again later";

    private record Check(String key, String window, int limit, Instant expiresAt, String message) {}

    private final UsageCounterRepository repository;
    private final TransactionTemplate tx;

    public UsageLimitService(UsageCounterRepository repository, PlatformTransactionManager txManager) {
        this.repository = repository;
        this.tx = new TransactionTemplate(txManager);
    }

    /** Call right before every Gemini request. Counts the attempt whether or not Gemini succeeds. */
    public void reservePhoto(UUID userId) {
        Instant now = Instant.now();
        reserve(List.of(
                new Check("photo:user:" + userId, dayWindow(), PHOTO_PER_USER_PER_DAY, dayExpiry(), PHOTO_USER_MSG),
                new Check("photo:app", dayWindow(), PHOTO_APP_PER_DAY, dayExpiry(), PHOTO_APP_MSG),
                new Check("photo:app", minuteWindow(now), PHOTO_APP_PER_MINUTE,
                        now.plus(Duration.ofMinutes(10)), PHOTO_APP_MSG)));
    }

    /** Per-user cap on food search / detail requests. */
    public void reserveFoodLookup(UUID userId) {
        Instant now = Instant.now();
        reserve(List.of(
                new Check("lookup:user:" + userId, hourWindow(now), LOOKUP_PER_USER_PER_HOUR,
                        now.plus(Duration.ofHours(3)), LOOKUP_USER_MSG)));
    }

    /** Whole-app cap. Call right before every real USDA request (cache hits do not count). */
    public void reserveUsdaCall() {
        Instant now = Instant.now();
        reserve(List.of(
                new Check("lookup:app", hourWindow(now), LOOKUP_APP_PER_HOUR,
                        now.plus(Duration.ofHours(3)), LOOKUP_APP_MSG)));
    }

    // Deletes finished windows so the table does not grow forever
    @Scheduled(cron = "0 15 * * * *")
    public void purgeExpired() {
        repository.deleteExpired(Instant.now());
    }

    // All checks pass and are counted together, or none is counted and the request is refused.
    private void reserve(List<Check> checks) {
        // fixed order, so two requests never lock the same rows in opposite order
        List<Check> ordered = checks.stream()
                .sorted(Comparator.comparing(Check::key).thenComparing(Check::window))
                .toList();

        for (Check c : ordered) {
            ensureRow(c);
        }

        tx.executeWithoutResult(status -> {
            for (Check c : ordered) {
                int updated = repository.incrementIfBelow(c.key(), c.window(), c.limit(), Instant.now());
                if (updated == 0) {
                    throw new TooManyRequestsException(c.message()); // rolls back the other increments
                }
            }
        });
    }

    private void ensureRow(Check c) {
        if (repository.existsByCounterKeyAndWindowId(c.key(), c.window())) return;
        UsageCounter row = new UsageCounter();
        row.setCounterKey(c.key());
        row.setWindowId(c.window());
        row.setUsed(0);
        row.setExpiresAt(c.expiresAt());
        try {
            repository.saveAndFlush(row);
        } catch (DataIntegrityViolationException e) {
            // another request created the same row first, which is fine
        }
    }

    private String dayWindow() {
        return "d:" + LocalDate.now(PACIFIC);
    }

    private Instant dayExpiry() {
        return LocalDate.now(PACIFIC).plusDays(2).atStartOfDay(PACIFIC).toInstant();
    }

    private String minuteWindow(Instant now) {
        return "m:" + (now.getEpochSecond() / 60);
    }

    private String hourWindow(Instant now) {
        return "h:" + (now.getEpochSecond() / 3600);
    }
}