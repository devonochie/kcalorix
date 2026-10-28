package com.kcalorix.insights.dto;

import java.time.Instant;

public record BurnedRow(Instant startedAt, Integer caloriesBurned) {}