package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.SessionSet;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SessionSetResponse(UUID id, UUID exerciseId, String exerciseName,
                                 int setNumber, Integer reps, BigDecimal weightKg,
                                 Integer durationSeconds, Integer distanceMeters,
                                 Instant loggedAt) {
    public static  SessionSetResponse from(SessionSet s) {
        return new SessionSetResponse(
                s.getId(),
                s.getExercise().getId(),
                s.getExercise().getName(),
                s.getSetNumber(),
                s.getReps(),
                s.getWeightKg(),
                s.getDurationSeconds(),
                s.getDistanceMeters(),
                s.getLoggedAt()
        );
    }

}
