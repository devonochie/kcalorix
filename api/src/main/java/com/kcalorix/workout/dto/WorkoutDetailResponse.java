package com.kcalorix.workout.dto;

import java.util.List;

public record WorkoutDetailResponse(WorkoutSummaryResponse workout, List<PlanExerciseResponse> exercises) {
}
