package com.kcalorix.notification.entity;

import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.notification.entity.enums.NotificationType;
import com.kcalorix.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "notifications",
        uniqueConstraints = @UniqueConstraint(name = "uq_notifications_user_type_date",
                columnNames = {"user_id", "type", "for_date"}),
        indexes = @Index(name = "idx_notifications_user_created", columnList = "user_id, created_at"))
@Getter
@Setter
@NoArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 300)
    private String message;

    // the user's local date the notification is about
    @Column(name = "for_date", nullable = false)
    private LocalDate forDate;

    @Column(name = "read_at")
    private Instant readAt;
}