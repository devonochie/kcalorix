package com.kcalorix.insights.service;


import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.insights.dto.TargetsResponse;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class TargetService {
    private final TargetCalculator targetCalculator;
    private final UserProfileRepository userProfileRepository;

    public TargetService(TargetCalculator targetCalculator,  UserProfileRepository userProfileRepository) {
        this.targetCalculator = targetCalculator;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public TargetsResponse getTargets(UUID userId) {
        UserProfile profile = userProfileRepository.findById(userId).orElseThrow(() -> new NotFoundException("Profile not found"));
        if (!profile.isOnboardingCompleted()) {
            throw new BadRequestException("Complete your profile first");
        }
        int age = Period.between(profile.getBirthDate(),
                LocalDate.now(ZoneId.of(profile.getTimezone()))).getYears();
        return targetCalculator.calculate(profile.getSex(), age, profile.getWeightKg(), profile.getHeightCm(), profile.getActivityLevel(), profile.getGoal(), profile.getWeeklyRateKg());

    }
}
