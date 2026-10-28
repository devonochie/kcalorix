package com.kcalorix.notification.entity;

import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
public class NotificationPreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private boolean enabled = true;

    // local time of day in the user's own timezone
    @Column(name = "nudge_time", nullable = false)
    private LocalTime nudgeTime = LocalTime.of(19, 0);
}