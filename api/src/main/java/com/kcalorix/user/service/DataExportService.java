package com.kcalorix.user.service;

import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.notification.entity.Notification;
import com.kcalorix.notification.repository.NotificationPreferenceRepository;
import com.kcalorix.nutrition.entity.MealEntry;
import com.kcalorix.user.dto.UserDataExport;
import com.kcalorix.user.dto.UserDataExport.*;
import com.kcalorix.user.entity.User;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.WeightLog;
import com.kcalorix.workout.entity.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DataExportService {

    private final EntityManager em;
    private final NotificationPreferenceRepository preferenceRepository;

    @Transactional(readOnly = true)
    public UserDataExport export(UUID userId) {
        User user = em.find(User.class, userId);
        if (user == null) throw new NotFoundException("User not found");

        UserProfile p = user.getProfile();

        List<Weight> weights = em.createQuery(
                        "select w from WeightLog w where w.user.id = :id order by w.logDate", WeightLog.class)
                .setParameter("id", userId).getResultList().stream()
                .map(w -> new Weight(w.getLogDate(), w.getWeightKg())).toList();

        List<Meal> meals = em.createQuery(
                        "select m from MealEntry m where m.user.id = :id order by m.logDate, m.createdAt", MealEntry.class)
                .setParameter("id", userId).getResultList().stream()
                .map(m -> new Meal(m.getLogDate(), m.getMealType().name(), m.getFoodName(), m.getBrand(),
                        m.getGrams(), m.getKcal(), m.getProteinG(), m.getCarbsG(), m.getFatG())).toList();

        // includes plans the user "deleted" (soft delete), since it is still their data
        List<Plan> plans = em.createQuery(
                        "select distinct p from WorkoutPlan p left join fetch p.days where p.user.id = :id order by p.createdAt",
                        WorkoutPlan.class)
                .setParameter("id", userId).getResultList().stream()
                .map(pl -> new Plan(pl.getName(), pl.getDescription(), pl.isActive(),
                        pl.getDays().stream()
                                .sorted(Comparator.comparingInt(PlanDay::getDayOrder))
                                .map(d -> new Day(d.getName(), d.getDayOrder(),
                                        d.getExercises().stream()
                                                .sorted(Comparator.comparingInt(PlanExercise::getPosition))
                                                .map(e -> new PlanEx(e.getExercise().getName(), e.getTargetSets(),
                                                        e.getTargetRepsMin(), e.getTargetRepsMax(),
                                                        e.getTargetDurationSeconds(), e.getRestSeconds(), e.getNotes()))
                                                .toList()))
                                .toList()))
                .toList();

        List<Session> sessions = em.createQuery(
                        "select s from WorkoutSession s where s.user.id = :id order by s.startedAt", WorkoutSession.class)
                .setParameter("id", userId).getResultList().stream()
                .map(s -> new Session(s.getPlanName(), s.getDayName(), s.getStatus().name(),
                        s.getStartedAt(), s.getEndedAt(), s.getDurationSeconds(), s.getWeightKgSnapshot(),
                        s.getCaloriesBurned(), s.getNotes(),
                        s.getSets().stream()
                                .sorted(Comparator.comparing(SessionSet::getLoggedAt))
                                .map(t -> new SetEntry(t.getExercise().getName(), t.getSetNumber(), t.getReps(),
                                        t.getWeightKg(), t.getDurationSeconds(), t.getDistanceMeters(), t.getLoggedAt()))
                                .toList()))
                .toList();

        NotificationPrefs prefs = preferenceRepository.findByUserId(userId)
                .map(n -> new NotificationPrefs(n.isEnabled(), n.getNudgeTime())).orElse(null);

        List<Notif> notifs = em.createQuery(
                        "select n from Notification n where n.user.id = :id order by n.createdAt desc", Notification.class)
                .setParameter("id", userId).getResultList().stream()
                .map(n -> new Notif(n.getType().name(), n.getTitle(), n.getMessage(), n.getForDate(),
                        n.getCreatedAt(), n.getReadAt())).toList();

        Profile profile = p == null ? null : new Profile(
                p.getSex() == null ? null : p.getSex().name(), p.getBirthDate(), p.getHeightCm(),
                p.getWeightKg(), p.getTargetWeightKg(),
                p.getActivityLevel() == null ? null : p.getActivityLevel().name(),
                p.getGoal() == null ? null : p.getGoal().name(),
                p.getWeeklyRateKg(), p.getUnitSystem().name(), p.getTimezone());

        return new UserDataExport(Instant.now(),
                new Account(user.getEmail(), p == null ? null : p.getDisplayName(),
                        user.isEmailVerified(), user.getCreatedAt()),
                profile, weights, meals, plans, sessions, prefs, notifs);
    }
}