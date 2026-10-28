package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.WorkoutSession;
import com.kcalorix.workout.entity.enums.SessionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SessionResponse (UUID id, UUID planId, String planName,
                               String dayName, SessionStatus status,
                               Instant startedAt, Instant warmupCompletedAt, Instant endedAt,
                               Integer durationSeconds, BigDecimal weightKgSnapshot,
                               Integer caloriesBurned, String notes, List<SessionSetResponse> sets) {
    public static SessionResponse from(WorkoutSession s) {
        return new SessionResponse(
                s.getId(),
                s.getPlanId(),
                s.getPlanName(),
                s.getDayName(),
                s.getStatus(),
                s.getStartedAt(),
                s.getWarmupCompletedAt(),
                s.getEndedAt(),
                s.getDurationSeconds(),
                s.getWeightKgSnapshot(),
                s.getCaloriesBurned(),
                s.getNotes(),
                s.getSets().stream().map(SessionSetResponse::from).toList()

        );
    }
}