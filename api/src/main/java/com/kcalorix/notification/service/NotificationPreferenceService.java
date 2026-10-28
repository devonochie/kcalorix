package com.kcalorix.notification.service;

import com.kcalorix.notification.dto.PreferencesResponse;
import com.kcalorix.notification.dto.UpdatePreferencesRequest;
import com.kcalorix.notification.entity.NotificationPreference;
import com.kcalorix.notification.repository.NotificationPreferenceRepository;
import com.kcalorix.user.repository.UserRepository; // adjust package
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationPreference getOrCreate(UUID userId) {
        return repository.findByUserId(userId).orElseGet(() -> {
            NotificationPreference p = new NotificationPreference();
            p.setUser(userRepository.getReferenceById(userId));
            p.setEnabled(true);
            p.setNudgeTime(LocalTime.of(19, 0));
            return repository.save(p);
        });
    }

    @Transactional
    public PreferencesResponse get(UUID userId) {
        return PreferencesResponse.from(getOrCreate(userId));
    }

    @Transactional
    public PreferencesResponse update(UUID userId, UpdatePreferencesRequest r) {
        NotificationPreference p = getOrCreate(userId);
        p.setEnabled(r.enabled());
        p.setNudgeTime(r.nudgeTime().withSecond(0).withNano(0));
        return PreferencesResponse.from(p);
    }
}