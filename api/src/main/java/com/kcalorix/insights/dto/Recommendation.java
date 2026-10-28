package com.kcalorix.insights.dto;

public record Recommendation(RecommendationType type, int kcal, String message) {}