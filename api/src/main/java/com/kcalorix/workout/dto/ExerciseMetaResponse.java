package com.kcalorix.workout.dto;

import java.util.List;

public record ExerciseMetaResponse(
        List<String> categories, List<String> muscles,
        List<String> equipment, List<String> difficulties) {}