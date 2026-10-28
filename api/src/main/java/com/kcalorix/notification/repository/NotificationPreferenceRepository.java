package com.kcalorix.notification.repository;

import com.kcalorix.notification.dto.NudgeCandidate;
import com.kcalorix.notification.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {
    Optional<NotificationPreference> findByUserId(UUID userId);
    @Query("""
    select new com.kcalorix.notification.dto.NudgeCandidate(p.user.id, p.nudgeTime, up.timezone)
    from NotificationPreference p, UserProfile up
    where up.id = p.user.id and p.enabled = true and up.onboardingCompleted = true
    """)
    List<NudgeCandidate> findNudgeCandidates();
}