package com.kcalorix.workout.dto;

import java.time.Instant;
import java.util.UUID;

public record SessionSummaryResponse(UUID id, String planName, String dayName, Instant startedAt,
                                     Integer durationSeconds, Integer caloriesBurned, long setCount) {}