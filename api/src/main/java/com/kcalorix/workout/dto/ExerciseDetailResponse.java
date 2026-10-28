package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.ExerciseMedia; // check this package
import com.kcalorix.workout.entity.enums.*;

import java.math.BigDecimal;
import java.util.*;

public record ExerciseDetailResponse(UUID id, String slug, String name, String description,
                                     ExerciseCategory category, TrackingType trackingType, MuscleGroup primaryMuscle,
                                     Set<MuscleGroup> secondaryMuscles, Equipment equipment,
                                     Difficulty difficulty, BigDecimal metValue,
                                     List<String> steps, List<String> tips,
                                     List<String> commonMistakes, String videoPath,
                                     String thumbnailPath, String animationKey) {

    public static ExerciseDetailResponse from(Exercise e) {
        ExerciseMedia m = e.getMedia();
        return new ExerciseDetailResponse(e.getId(), e.getSlug(), e.getName(), e.getDescription(),
                e.getCategory(), e.getTrackingType(), e.getPrimaryMuscle(),
                new HashSet<>(e.getSecondaryMuscles()), e.getEquipment(), e.getDifficulty(),
                e.getMetValue(), new ArrayList<>(e.getSteps()), new ArrayList<>(e.getTips()),
                new ArrayList<>(e.getCommonMistakes()),
                m == null ? null : m.getVideoPath(),
                m == null ? null : m.getThumbnailPath(),
                m == null ? null : m.getAnimationKey());
    }
}