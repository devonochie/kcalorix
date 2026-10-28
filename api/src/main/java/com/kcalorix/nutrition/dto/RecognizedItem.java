package com.kcalorix.nutrition.dto;

import java.util.List;

public record RecognizedItem(String name, int estimatedGrams, String confidence,
                             List<FoodSearchItem> matches) {}