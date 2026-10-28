package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.enums.Difficulty;
import com.kcalorix.workout.entity.enums.WorkoutCategory;

import java.util.UUID;

public record WorkoutSummaryResponse(UUID id, UUID dayId, String slug, String name, String description,
                                     WorkoutCategory category, Difficulty level,
                                     int estimatedMinutes, int exerciseCount) {
}
