package com.kcalorix.workout.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record LogSetRequest(@NotNull UUID exerciseId,
                            @Min(1) @Max(200) Integer reps,
                            @DecimalMin("0") @DecimalMax("1000") BigDecimal weightKg,
                            @Min(1) @Max(14400) Integer durationSeconds,
                            @Min(1) @Max(200000) Integer distanceMeters	) {
}
