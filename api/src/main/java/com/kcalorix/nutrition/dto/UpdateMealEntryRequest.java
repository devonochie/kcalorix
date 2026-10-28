package com.kcalorix.nutrition.dto;

import com.kcalorix.nutrition.entity.enums.MealType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateMealEntryRequest(
        @NotNull MealType mealType,
        @NotNull @DecimalMin("1") @DecimalMax("5000") BigDecimal grams) {}