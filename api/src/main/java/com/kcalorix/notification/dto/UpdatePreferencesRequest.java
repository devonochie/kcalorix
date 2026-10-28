package com.kcalorix.notification.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record UpdatePreferencesRequest(
        @NotNull Boolean enabled,
        @NotNull LocalTime nudgeTime) {}