package com.kcalorix.workout.service;

import com.kcalorix.workout.entity.SessionSet;
import com.kcalorix.workout.entity.enums.TrackingType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.List;

@Component
public class CalorieBurnCalculator {

    private static final int MAX_DURATION_SECONDS = 14400;
    private static final BigDecimal SECONDS_PER_HOUR = BigDecimal.valueOf(3600);
    private static final MathContext MC = MathContext.DECIMAL64;

    public int calculate(List<SessionSet> sets, int durationSeconds, BigDecimal weightKg) {
        int duration = Math.min(durationSeconds, MAX_DURATION_SECONDS);

        List<SessionSet> timedSets = sets.stream()
                .filter(s -> isTimed(s.getExercise().getTrackingType()))
                .toList();
        List<SessionSet> repSets = sets.stream()
                .filter(s -> isReps(s.getExercise().getTrackingType()))
                .toList();

        long timedSeconds = timedSets.stream()
                .mapToLong(s -> s.getDurationSeconds() == null ? 0 : s.getDurationSeconds())
                .sum();

        BigDecimal scale = BigDecimal.ONE;
        if (timedSeconds > duration) {
            scale = BigDecimal.valueOf(duration).divide(BigDecimal.valueOf(timedSeconds), MC);
        }

        BigDecimal timedKcal = BigDecimal.ZERO;
        for (SessionSet s : timedSets) {
            BigDecimal seconds = BigDecimal.valueOf(s.getDurationSeconds() == null ? 0 : s.getDurationSeconds())
                    .multiply(scale, MC);
            timedKcal = timedKcal.add(
                    s.getExercise().getMetValue()
                            .multiply(weightKg, MC)
                            .multiply(seconds, MC)
                            .divide(SECONDS_PER_HOUR, MC),
                    MC);
        }

        long remaining = Math.max(0, duration - timedSeconds);

        BigDecimal repKcal = BigDecimal.ZERO;
        if (!repSets.isEmpty()) {
            BigDecimal sumMet = repSets.stream()
                    .map(s -> s.getExercise().getMetValue())
                    .reduce(BigDecimal.ZERO, (a, b) -> a.add(b, MC));
            BigDecimal avgMet = sumMet.divide(BigDecimal.valueOf(repSets.size()), MC);
            repKcal = avgMet
                    .multiply(weightKg, MC)
                    .multiply(BigDecimal.valueOf(remaining), MC)
                    .divide(SECONDS_PER_HOUR, MC);
        }

        return timedKcal.add(repKcal, MC)
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();
    }

    private static boolean isTimed(TrackingType t) {
        return t == TrackingType.DURATION || t == TrackingType.DISTANCE_DURATION;
    }

    private static boolean isReps(TrackingType t) {
        return t == TrackingType.REPS_WEIGHT || t == TrackingType.REPS_ONLY;
    }
}