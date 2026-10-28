package com.kcalorix.nutrition.dto;

import java.math.BigDecimal;

public record FoodSearchItem(long fdcId, String description, String brand, String dataType, BigDecimal kcal, BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {
}
