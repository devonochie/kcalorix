package com.kcalorix.nutrition.recognition;

public record DetectedFood(String name, int estimatedGrams, String confidence) {}