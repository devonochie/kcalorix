package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.WorkoutPlan;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PlanResponse(UUID id, String name, String description, List<PlanDayResponse> days, Instant createdAt) {
   public static PlanResponse from(WorkoutPlan workoutPlan) {
       return new PlanResponse(
               workoutPlan.getId(),
               workoutPlan.getName(),
               workoutPlan.getDescription(),
               workoutPlan.getDays().stream().map(PlanDayResponse::from).toList(),
               workoutPlan.getCreatedAt()
       );
   }
}
