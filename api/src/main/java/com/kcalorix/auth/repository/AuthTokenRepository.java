package com.kcalorix.auth.repository;

import com.kcalorix.auth.entity.AuthToken;
import com.kcalorix.auth.entity.enums.AuthTokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {

    Optional<AuthToken> findByTokenHashAndType(String tokenHash, AuthTokenType type);

    boolean existsByUserIdAndTypeAndCreatedAtAfter(UUID userId, AuthTokenType type, Instant after);

    // returns 1 only for the caller that gets there first, so a token is never used twice
    @Modifying
    @Query("update AuthToken t set t.usedAt = :now where t.id = :id and t.usedAt is null")
    int markUsed(@Param("id") UUID id, @Param("now") Instant now);

    @Modifying
    @Query("update AuthToken t set t.usedAt = :now where t.user.id = :userId and t.type = :type and t.usedAt is null")
    int invalidateAll(@Param("userId") UUID userId, @Param("type") AuthTokenType type, @Param("now") Instant now);

    @Modifying
    @Query("delete from AuthToken t where t.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") Instant cutoff);

    long countByUserIdAndTypeAndCreatedAtAfter(UUID userId, AuthTokenType type, Instant after);
}