package com.kcalorix.nutrition.dto;

import com.kcalorix.nutrition.entity.enums.MealType;

import java.util.List;

public record MealGroupResponse(MealType mealType, NutrientTotals totals, List<MealEntryResponse> entries) {}