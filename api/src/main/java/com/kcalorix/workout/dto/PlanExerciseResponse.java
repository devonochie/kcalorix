package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.PlanExercise;

import java.util.UUID;

public record PlanExerciseResponse(UUID id, ExerciseSummaryResponse exercise, int position, int targetSets,
                                   Integer targetRepsMin, Integer targetRepsMax, Integer targetDurationSeconds,
                                   int restSeconds, String notes) {

    public static PlanExerciseResponse from(PlanExercise pe) {
        return new PlanExerciseResponse(
                pe.getId(),
                ExerciseSummaryResponse.from(pe.getExercise()),
                pe.getPosition(),
                pe.getTargetSets(),
                pe.getTargetRepsMin(),
                pe.getTargetRepsMax(),
                pe.getTargetDurationSeconds(),
                pe.getRestSeconds(),
                pe.getNotes()
        );
    }
}