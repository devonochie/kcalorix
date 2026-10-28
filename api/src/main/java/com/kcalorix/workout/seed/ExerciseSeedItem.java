package com.kcalorix.workout.seed;

import com.kcalorix.workout.entity.enums.*;

import java.math.BigDecimal;
import java.util.List;

public record ExerciseSeedItem(
        String slug, String name, String description,
        ExerciseCategory category, TrackingType trackingType,
        MuscleGroup primaryMuscle, List<MuscleGroup> secondaryMuscles,
        Equipment equipment, Difficulty difficulty, BigDecimal metValue,
        List<String> steps, List<String> tips, List<String> commonMistakes,
        String videoPath, String thumbnailPath, String animationKey) {}