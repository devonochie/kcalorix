package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.ExerciseMedia; // check this package
import com.kcalorix.workout.entity.enums.Difficulty;
import com.kcalorix.workout.entity.enums.Equipment;
import com.kcalorix.workout.entity.enums.ExerciseCategory;
import com.kcalorix.workout.entity.enums.MuscleGroup;

import java.util.UUID;

public record ExerciseSummaryResponse(UUID id, String slug, String name, ExerciseCategory category,
                                      MuscleGroup primaryMuscle, Equipment equipment, Difficulty difficulty,
                                      String thumbnailPath, boolean hasAnimation) {

    public static ExerciseSummaryResponse from(Exercise e) {
        ExerciseMedia m = e.getMedia();
        return new ExerciseSummaryResponse(e.getId(), e.getSlug(), e.getName(), e.getCategory(),
                e.getPrimaryMuscle(), e.getEquipment(), e.getDifficulty(),
                m == null ? null : m.getThumbnailPath(),
                m != null && m.getAnimationKey() != null);
    }
}