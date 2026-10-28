package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.enums.TrackingType;

import java.math.BigDecimal;
import java.util.UUID;

public record ExerciseRecordResponse(UUID exerciseId, String exerciseName, TrackingType trackingType,
                                     BigDecimal bestWeightKg, Double bestOneRepMaxKg,
                                     Integer maxReps, Integer longestDurationSeconds,
                                     Integer longestDistanceMeters) {

    public ExerciseRecordResponse {
        if (bestOneRepMaxKg != null) {
            bestOneRepMaxKg = Math.round(bestOneRepMaxKg * 10) / 10.0;
        }
    }
}