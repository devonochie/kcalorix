package com.kcalorix.nutrition.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BatchMealItem(
        @NotNull @Positive Long fdcId,
        @NotNull @DecimalMin("1") @DecimalMax("5000") BigDecimal grams) {}