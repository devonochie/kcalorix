package com.kcalorix.workout.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public record UpdateSetRequest(@Min(1) @Max(200) Integer reps,
                               @DecimalMin("0") @DecimalMax("1000") BigDecimal weightKg,
                               @Min(1) @Max(14400) Integer durationSeconds,
                               @Min(1) @Max(200000) Integer distanceMeters	) {
}
