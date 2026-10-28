package com.kcalorix.nutrition.dto;

import com.kcalorix.nutrition.entity.MealEntry;
import com.kcalorix.nutrition.entity.enums.MealType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MealEntryResponse(UUID id, LocalDate date, MealType mealType, Long fdcId,
                                String foodName, String brand, BigDecimal grams,
                                BigDecimal kcal, BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {

    public static MealEntryResponse from(MealEntry e) {
        return new MealEntryResponse(e.getId(), e.getLogDate(), e.getMealType(), e.getFdcId(),
                e.getFoodName(), e.getBrand(), e.getGrams(),
                e.getKcal(), e.getProteinG(), e.getCarbsG(), e.getFatG());
    }
}