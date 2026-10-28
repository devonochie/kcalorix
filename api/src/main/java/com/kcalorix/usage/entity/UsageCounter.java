package com.kcalorix.usage.entity;

import com.kcalorix.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "usage_counters",
        uniqueConstraints = @UniqueConstraint(name = "uk_usage_counters_key_window",
                columnNames = {"counter_key", "window_id"}),
        indexes = @Index(name = "idx_usage_counters_expires_at", columnList = "expires_at"))
@Getter
@Setter
@NoArgsConstructor
public class UsageCounter extends BaseEntity {

    @Column(name = "counter_key", nullable = false, length = 100)
    private String counterKey; // e.g. "photo:user:<uuid>" or "photo:app"

    @Column(name = "window_id", nullable = false, length = 40)
    private String windowId; // e.g. "d:2026-10-22", "m:<epoch minute>", "h:<epoch hour>"

    @Column(nullable = false)
    private int used;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt; // row is deleted after this
}