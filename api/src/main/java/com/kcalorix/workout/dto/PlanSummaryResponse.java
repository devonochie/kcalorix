package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.WorkoutPlan;

import java.time.Instant;
import java.util.UUID;

public record PlanSummaryResponse(UUID id, String name, String description, int dayCount, Instant createdAt) {

    public static PlanSummaryResponse from(WorkoutPlan p) {
        return new PlanSummaryResponse(p.getId(), p.getName(), p.getDescription(),
                p.getDays().size(), p.getCreatedAt());
    }
}