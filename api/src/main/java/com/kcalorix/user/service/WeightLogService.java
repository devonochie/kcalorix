package com.kcalorix.user.service;


import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.dto.WeightLogResponse;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.WeightLog;
import com.kcalorix.user.repository.UserProfileRepository;
import com.kcalorix.user.repository.UserRepository;
import com.kcalorix.user.repository.WeightLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class WeightLogService {
    private final WeightLogRepository weightLogRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public WeightLogService(WeightLogRepository weightLogRepository,  UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.weightLogRepository = weightLogRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public WeightLogResponse record(UUID userId, LocalDate date, BigDecimal kg) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        LocalDate today = LocalDate.now(ZoneId.of(profile.getTimezone()));
        if (date.isAfter(today)) {
            throw new BadRequestException("Date cannot be in the future");
        }

        WeightLog log = weightLogRepository.findByUserIdAndLogDate(userId, date)
                .orElseGet(() -> {
                    WeightLog w = new WeightLog();
                    w.setUser(userRepository.getReferenceById(userId));
                    w.setLogDate(date);
                    return w;
                });

        log.setWeightKg(kg);
        weightLogRepository.save(log);

        if (!weightLogRepository.existsByUserIdAndLogDateAfter(userId, date)) {
            profile.setWeightKg(kg);
        }

        return new WeightLogResponse(log.getLogDate(), log.getWeightKg());
    }

    @Transactional(readOnly = true)
    public List<WeightLogResponse> list(UUID userId, LocalDate from, LocalDate to) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        LocalDate today = LocalDate.now(ZoneId.of(profile.getTimezone()));

        if (to == null) to = today;
        if (from == null) from = to.minusDays(90);

        if (from.isAfter(to) || ChronoUnit.DAYS.between(from, to) > 366) {
            throw new BadRequestException("Invalid date range");
        }

        return weightLogRepository
                .findByUserIdAndLogDateBetweenOrderByLogDateAsc(userId, from, to)
                .stream()
                .map(w -> new WeightLogResponse(w.getLogDate(), w.getWeightKg()))
                .toList();
    }
}
