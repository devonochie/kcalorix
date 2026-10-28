package com.kcalorix.user.service;

import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.notification.service.NotificationPreferenceService;
import com.kcalorix.user.dto.ProfileRequest;
import com.kcalorix.user.dto.ProfileResponse;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.enums.Goal;
import com.kcalorix.user.repository.UserProfileRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.UUID;


@Service
public class ProfileService {
    private final UserProfileRepository userProfileRepository;
    private final WeightLogService weightLogService;
    private final NotificationPreferenceService notificationPreferenceService;

    public ProfileService(UserProfileRepository userProfileRepository,
                          WeightLogService weightLogService,
                          NotificationPreferenceService notificationPreferenceService) {
        this.userProfileRepository = userProfileRepository;
        this.weightLogService = weightLogService;
        this.notificationPreferenceService = notificationPreferenceService;
    }

    @Transactional(readOnly=true)
    public ProfileResponse getProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        return ProfileResponse.from(profile);

    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, ProfileRequest r) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        ZoneId zone;
        try {
            zone = ZoneId.of(r.timezone());
        } catch (DateTimeException e) {
            throw new BadRequestException("Invalid timezone");
        }

        int age = Period.between(r.birthDate(), LocalDate.now(zone)).getYears();
        if (age < 18 || age > 100) {
            throw new BadRequestException("You must be between 18 and 100");
        }

        if (r.targetWeightKg() != null && r.weightKg() != null) {
            int i = r.targetWeightKg().compareTo(r.weightKg());

            if (r.goal() == Goal.LOSE && i >= 0) {
                throw new BadRequestException("Target weight must be below current weight for a LOSE goal");
            }
            if (r.goal() == Goal.GAIN && i <= 0) {
                throw new BadRequestException("Target weight must be above current weight for a GAIN goal");
            }
        }

        BigDecimal rate = getBigDecimal(r);

        profile.setDisplayName(r.displayName().trim());
        profile.setSex(r.sex());
        profile.setBirthDate(r.birthDate());
        profile.setHeightCm(r.heightCm());
        profile.setWeightKg(r.weightKg());
        profile.setGoal(r.goal());
        profile.setTargetWeightKg(r.targetWeightKg());
        profile.setActivityLevel(r.activityLevel());
        profile.setUnitSystem(r.unitSystem());
        profile.setWeeklyRateKg(rate);
        profile.setOnboardingCompleted(true);
        profile.setTimezone(zone.getId());
        profile.setExperienceLevel(r.experienceLevel());
        profile.setDaysPerWeek(r.daysPerWeek());
        profile.setEquipmentAccess(r.equipmentAccess());

        userProfileRepository.save(profile);
        weightLogService.record(userId, LocalDate.now(zone), r.weightKg());
        notificationPreferenceService.getOrCreate(userId);
        return ProfileResponse.from(profile);

    }

    private static @Nullable BigDecimal getBigDecimal(ProfileRequest r) {
        BigDecimal rate  = null;
        if (r.goal() == Goal.LOSE) {
            rate = r.weeklyRateKg() != null ? r.weeklyRateKg() : new BigDecimal("0.5");
        } else if (r.goal() == Goal.GAIN) {
            rate = r.weeklyRateKg() != null ? r.weeklyRateKg() : new BigDecimal("0.25");
        }
        if (rate != null) {
            if (rate.signum() <= 0) {
                throw new BadRequestException("Weekly rate must be greater than 0");
            }
            if (rate.compareTo(new BigDecimal("0.5")) > 0) {
                throw new BadRequestException("Weekly rate must not exceed 0.5 kg per week");
            }
        }
        return rate;
    }
}