package com.kcalorix.notification.dto;

import com.kcalorix.notification.entity.Notification;
import com.kcalorix.notification.entity.enums.NotificationType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record NotificationResponse(UUID id, NotificationType type, String title, String message,
                                   LocalDate forDate, Instant createdAt, boolean read) {

    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getForDate(), n.getCreatedAt(), n.getReadAt() != null);
    }
}