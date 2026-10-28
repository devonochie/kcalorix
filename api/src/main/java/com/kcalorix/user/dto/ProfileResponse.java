package com.kcalorix.user.dto;

import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.enums.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfileResponse(@NotBlank @Size(max = 60) String displayName,
                              @NotNull Sex sex,
                              @NotNull LocalDate birthDate,
                              @NotNull @DecimalMin("100") @DecimalMax("250") BigDecimal heightCm,
                              @NotNull @DecimalMin("30") @DecimalMax("300") BigDecimal weightKg,
                              @NotNull @DecimalMin("30") @DecimalMax("300") BigDecimal targetWeightKg,
                              @NotNull ActivityLevel activityLevel,
                              @NotNull Goal goal,
                              @DecimalMin("0.1") @DecimalMax("1.0") BigDecimal weeklyRateKg,
                              @NotNull UnitSystem unitSystem,
                              @NotBlank @Size(max = 60) String timezone,
                              ExperienceLevel experienceLevel,
                              Integer daysPerWeek,
                              EquipmentAccess equipmentAccess,
                              boolean onboardingCompleted) {

    public static ProfileResponse from(UserProfile p) {
        return new ProfileResponse(
                p.getDisplayName(),
                p.getSex(),
                p.getBirthDate(),
                p.getHeightCm(),
                p.getWeightKg(),
                p.getTargetWeightKg(),
                p.getActivityLevel(),
                p.getGoal(),
                p.getWeeklyRateKg(),
                p.getUnitSystem(),
                p.getTimezone(),
                p.getExperienceLevel(),
                p.getDaysPerWeek(),
                p.getEquipmentAccess(),
                p.isOnboardingCompleted()
        );
    }
}