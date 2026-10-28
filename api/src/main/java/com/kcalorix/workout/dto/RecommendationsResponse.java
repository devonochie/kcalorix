package com.kcalorix.workout.dto;

import com.kcalorix.user.entity.enums.Goal;

import java.util.List;

public record RecommendationsResponse(Goal goal, String headline, List<RecommendedExerciseResponse> items) {}