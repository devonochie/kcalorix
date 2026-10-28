package com.kcalorix.user.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeightLogRequest(@NotNull LocalDate date,
                               @NotNull @DecimalMin("30") @DecimalMax("300") BigDecimal weightKg ) {}
