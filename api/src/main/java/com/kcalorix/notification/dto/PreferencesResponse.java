package com.kcalorix.notification.dto;

import com.kcalorix.notification.entity.NotificationPreference;

import java.time.LocalTime;

public record PreferencesResponse(boolean enabled, LocalTime nudgeTime) {

    public static PreferencesResponse from(NotificationPreference p) {
        return new PreferencesResponse(p.isEnabled(), p.getNudgeTime());
    }
}