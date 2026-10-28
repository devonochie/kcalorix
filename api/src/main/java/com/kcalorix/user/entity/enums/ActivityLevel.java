package com.kcalorix.user.entity.enums;

public enum ActivityLevel {
    SEDENTARY(1.2),
    LIGHT(1.375),
    MODERATE(1.55),
    VERY_ACTIVE(1.725),
    EXTRA_ACTIVE(1.9);

    private final double factor;
    ActivityLevel(double factor) {
        this.factor = factor;
    }

    public double getFactor() {
        return factor;
    }
}
