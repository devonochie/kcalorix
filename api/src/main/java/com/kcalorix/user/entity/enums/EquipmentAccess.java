package com.kcalorix.user.entity.enums;

import com.kcalorix.workout.entity.enums.Equipment;

import java.util.EnumSet;
import java.util.Set;

public enum EquipmentAccess {
    GYM(EnumSet.allOf(Equipment.class)),
    HOME_BASIC(EnumSet.of(Equipment.BODYWEIGHT, Equipment.DUMBBELL, Equipment.BAND, Equipment.KETTLEBELL)),
    NONE(EnumSet.of(Equipment.BODYWEIGHT));

    private final Set<Equipment> allowed;

    EquipmentAccess(Set<Equipment> allowed) {
        this.allowed = allowed;
    }

    public Set<Equipment> getAllowed() {
        return allowed;
    }
}
