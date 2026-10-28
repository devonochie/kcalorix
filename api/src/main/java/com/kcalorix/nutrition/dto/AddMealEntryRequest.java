package com.kcalorix.nutrition.dto;

import com.kcalorix.nutrition.entity.enums.MealType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AddMealEntryRequest(
        @NotNull LocalDate date,
        @NotNull MealType mealType,
        @NotNull @Positive Long fdcId,
        @NotNull @DecimalMin("1") @DecimalMax("5000") BigDecimal grams) {}