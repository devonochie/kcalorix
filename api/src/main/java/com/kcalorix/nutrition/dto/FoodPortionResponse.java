package com.kcalorix.nutrition.dto;

import java.math.BigDecimal;

public record FoodPortionResponse(String label, BigDecimal gramWeight) {
}
