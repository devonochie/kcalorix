package com.kcalorix.workout.entity.enums;

public enum WorkoutCategory {
    FULL_BODY,
    CHEST,
    BACK,
    SHOULDERS,
    ARMS,
    LEGS,
    GLUTES,
    ABS_CORE,      // kept so existing rows keep working; shown as "Core" in the UI
    CARDIO_HIIT,   // kept so existing rows keep working; shown as "Cardio" in the UI

    /** @deprecated legacy values. They stay only so old DB rows can still load. */
    @Deprecated UPPER_BODY,
    @Deprecated LOWER_BODY
}