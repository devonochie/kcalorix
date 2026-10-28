package com.kcalorix.insights.dto;

import java.math.BigDecimal;
import java.util.List;

public record TargetsResponse(int bmr, int tdee, int calorieTarget, int proteinG,
                              int carbsG, int fatG, BigDecimal weeklyRateKg, List<String> notes
                              ) {}
