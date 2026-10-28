package com.kcalorix.notification.entity;

import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One browser/device a user allowed push on. A user can have several (phone, laptop). */
@Entity
@Table(name = "push_subscriptions",
        uniqueConstraints = @UniqueConstraint(name = "uq_push_endpoint", columnNames = "endpoint"),
        indexes = @Index(name = "idx_push_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class PushSubscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 1000)
    private String endpoint;

    @Column(name = "p256dh", nullable = false, length = 200)
    private String p256dh;

    @Column(name = "auth_key", nullable = false, length = 100)
    private String authKey;
}