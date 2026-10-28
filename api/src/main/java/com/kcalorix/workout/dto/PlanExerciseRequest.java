package com.kcalorix.workout.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PlanExerciseRequest (@NotNull UUID exerciseId,
                                   @NotNull @Min(1) @Max(10)Integer targetSets,
                                   @Min(1) @Max(100) Integer targetRepsMin,
                                   @Min(1) @Max(100) Integer targetRepsMax,
                                   @Min(5) @Max(7200) Integer targetDurationSeconds,
                                   @Min(0) @Max(600) Integer restSeconds,
                                   @Size(max=300) String notes) {
}
