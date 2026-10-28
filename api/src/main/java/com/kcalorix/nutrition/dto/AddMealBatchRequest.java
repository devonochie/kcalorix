package com.kcalorix.nutrition.dto;

import com.kcalorix.nutrition.entity.enums.MealType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record AddMealBatchRequest(
        @NotNull LocalDate date,
        @NotNull MealType mealType,
        @NotEmpty @Size(max = 10) @Valid List<BatchMealItem> items) {}