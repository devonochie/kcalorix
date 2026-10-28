package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.PlanDay;

import java.util.List;
import java.util.UUID;

public record PlanDayResponse(UUID id, String name, int dayOrder, List<PlanExerciseResponse> exercises) {
    public static PlanDayResponse from(PlanDay planDay) {
        return new PlanDayResponse(
                planDay.getId(),
                planDay.getName(),
                planDay.getDayOrder(),
                planDay.getExercises().stream().map(PlanExerciseResponse::from).toList()
        );
    }
}
