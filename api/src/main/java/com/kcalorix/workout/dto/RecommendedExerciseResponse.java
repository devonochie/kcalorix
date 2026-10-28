package com.kcalorix.workout.dto;

public record RecommendedExerciseResponse(ExerciseSummaryResponse exercise, String reason) {}