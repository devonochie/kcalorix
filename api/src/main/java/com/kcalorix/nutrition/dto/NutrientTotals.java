package com.kcalorix.nutrition.dto;

import java.math.BigDecimal;

public record NutrientTotals(BigDecimal kcal, BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {}