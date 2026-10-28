package com.kcalorix.workout.seed;

import com.kcalorix.workout.entity.enums.Difficulty;
import com.kcalorix.workout.entity.enums.WorkoutCategory;

import java.util.List;

public record WorkoutSeedItem(
        String slug, String name, String description,
        WorkoutCategory category, Difficulty level,
        int restSeconds, List<Entry> exercises) {

    public record Entry(String exercise, int sets, Integer reps, Integer durationSeconds) {}
}
