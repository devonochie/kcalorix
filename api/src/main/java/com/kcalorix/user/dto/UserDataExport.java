package com.kcalorix.user.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record UserDataExport(
        Instant exportedAt,
        Account account,
        Profile profile,
        List<Weight> weightLogs,
        List<Meal> meals,
        List<Plan> workoutPlans,
        List<Session> workoutSessions,
        NotificationPrefs notificationPreferences,
        List<Notif> notifications) {

    public record Account(String email, String displayName, boolean emailVerified, Instant createdAt) {}

    public record Profile(String sex, LocalDate birthDate, BigDecimal heightCm, BigDecimal weightKg,
                          BigDecimal targetWeightKg, String activityLevel, String goal,
                          BigDecimal weeklyRateKg, String unitSystem, String timezone) {}

    public record Weight(LocalDate date, BigDecimal weightKg) {}

    public record Meal(LocalDate date, String mealType, String food, String brand, BigDecimal grams,
                       BigDecimal kcal, BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {}

    public record Plan(String name, String description, boolean active, List<Day> days) {}
    public record Day(String name, int order, List<PlanEx> exercises) {}
    public record PlanEx(String exercise, int sets, Integer repsMin, Integer repsMax,
                         Integer durationSeconds, int restSeconds, String notes) {}

    public record Session(String plan, String day, String status, Instant startedAt, Instant endedAt,
                          Integer durationSeconds, BigDecimal bodyWeightKg, Integer caloriesBurned,
                          String notes, List<SetEntry> sets) {}
    public record SetEntry(String exercise, int setNumber, Integer reps, BigDecimal weightKg,
                           Integer durationSeconds, Integer distanceMeters, Instant loggedAt) {}

    public record NotificationPrefs(boolean enabled, LocalTime nudgeTime) {}
    public record Notif(String type, String title, String message, LocalDate forDate,
                        Instant createdAt, Instant readAt) {}
}