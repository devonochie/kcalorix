package com.kcalorix.nutrition.dto;

import java.time.LocalDate;
import java.util.List;

public record DiaryResponse(LocalDate date, NutrientTotals totals, List<MealGroupResponse> meals) {}