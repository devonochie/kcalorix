package com.kcalorix.auth.entity;

import com.kcalorix.auth.entity.enums.AuthTokenType;
import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "auth_tokens", indexes = {
        @Index(name = "idx_auth_tokens_hash", columnList = "token_hash", unique = true),
        @Index(name = "idx_auth_tokens_user_type", columnList = "user_id, type")})
@Getter
@Setter
@NoArgsConstructor
public class AuthToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuthTokenType type;

    // SHA-256 hex of the token; the raw token is never stored
    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;
}