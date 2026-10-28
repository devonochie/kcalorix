package com.kcalorix.user.dto;

import com.kcalorix.user.entity.enums.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfileRequest(@NotBlank @Size(max = 60) String displayName,
                             @NotNull Sex sex,
                             @NotNull @Past LocalDate birthDate,
                             @NotNull @DecimalMin("100") @DecimalMax("250") BigDecimal heightCm,
                             @NotNull @DecimalMin("30") @DecimalMax("300") BigDecimal weightKg,
                             @NotNull @DecimalMin("30") @DecimalMax("300") BigDecimal targetWeightKg,
                             @NotNull ActivityLevel activityLevel,
                             @NotNull Goal goal,
                             @DecimalMin("0.1") @DecimalMax("1.0") BigDecimal weeklyRateKg,
                             @NotNull UnitSystem unitSystem,
                             @NotBlank @Size(max = 60) String timezone,
                             @NotNull ExperienceLevel experienceLevel,
                             @NotNull @Min(2) @Max(6) Integer daysPerWeek,
                             @NotNull EquipmentAccess equipmentAccess
                             ) {}
