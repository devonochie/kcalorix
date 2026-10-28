package com.kcalorix.nutrition.dto;

import java.math.BigDecimal;
import java.util.List;

public record FoodDetailResponse(long fdcId, String description, String brand, String dataType, BigDecimal kcal, BigDecimal proteinG, BigDecimal carbsG,
                                 BigDecimal fatG, BigDecimal fiberG, BigDecimal sugarG, BigDecimal sodiumMg, List<FoodPortionResponse> portions) {
}
