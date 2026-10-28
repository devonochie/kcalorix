package com.kcalorix.usage.repository;

import com.kcalorix.usage.entity.UsageCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

public interface UsageCounterRepository extends JpaRepository<UsageCounter, UUID> {

    boolean existsByCounterKeyAndWindowId(String counterKey, String windowId);

    // One atomic statement: adds 1 only if the cap is not reached. Returns 0 rows when the cap is hit.
    @Transactional
    @Modifying
    @Query("""
            update UsageCounter c
            set c.used = c.used + 1, c.updatedAt = :now
            where c.counterKey = :key and c.windowId = :window and c.used < :limit
            """)
    int incrementIfBelow(@Param("key") String key,
                         @Param("window") String window,
                         @Param("limit") int limit,
                         @Param("now") Instant now);

    @Transactional
    @Modifying
    @Query("delete from UsageCounter c where c.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}