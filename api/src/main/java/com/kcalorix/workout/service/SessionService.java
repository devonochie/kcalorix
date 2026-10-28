package com.kcalorix.workout.service;

import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.ConflictException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.repository.UserProfileRepository; // adjust package
import com.kcalorix.user.repository.UserRepository;        // adjust package
import com.kcalorix.workout.dto.*;
import com.kcalorix.workout.entity.*;
import com.kcalorix.workout.entity.enums.SessionStatus;
import com.kcalorix.workout.entity.enums.TrackingType;
import com.kcalorix.workout.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private static final int MAX_SETS = 200;
    private static final int MAX_DURATION_SECONDS = 14400;

    private final SessionSetRepository setRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;
    private final CalorieBurnCalculator calorieBurnCalculator;
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public SessionResponse start(UUID userId, StartSessionRequest req) {
        if (workoutSessionRepository.findFirstByUserIdAndStatus(userId, SessionStatus.IN_PROGRESS).isPresent()) {
            throw new ConflictException("You already have a workout in progress");
        }

        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Set your weight in your profile first"));
        if (profile.getWeightKg() == null) {
            throw new BadRequestException("Set your weight in your profile first");
        }

        WorkoutSession session = new WorkoutSession();

        if (req.planId() != null) {
            if (req.dayId() == null) {
                throw new BadRequestException("dayId is required when planId is set");
            }
            WorkoutPlan plan = workoutPlanRepository.findByIdAndUserIdAndActiveTrue(req.planId(), userId)
                    .or(() -> workoutPlanRepository.findByIdAndUserIsNullAndActiveTrue(req.planId()))
                    .orElseThrow(() -> new NotFoundException("Plan not found"));
            PlanDay day = plan.getDays().stream()
                    .filter(d -> d.getId().equals(req.dayId()))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Plan day not found"));
            session.setPlanId(plan.getId());
            session.setPlanName(plan.getName());
            session.setDayName(day.getName());
        } else if (req.dayId() != null) {
            throw new BadRequestException("planId is required when dayId is set");
        }

        session.setUser(userRepository.getReferenceById(userId));
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setStartedAt(Instant.now());
        session.setWeightKgSnapshot(profile.getWeightKg());

        return SessionResponse.from(workoutSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public SessionResponse getActive(UUID userId) {
        WorkoutSession session = workoutSessionRepository
                .findFirstByUserIdAndStatus(userId, SessionStatus.IN_PROGRESS)
                .orElseThrow(() -> new NotFoundException("No active workout"));
        return SessionResponse.from(session);
    }

    @Transactional(readOnly = true)
    public SessionResponse get(UUID userId, UUID id) {
        return SessionResponse.from(find(userId, id));
    }

    @Transactional
    public SessionResponse completeWarmup(UUID userId, UUID sessionId) {
        WorkoutSession session = find(userId, sessionId);
        requireInProgress(session);
        if (session.getWarmupCompletedAt() == null) {
            session.setWarmupCompletedAt(Instant.now());
        }
        return SessionResponse.from(session);
    }

    @Transactional
    public SessionSetResponse logSet(UUID userId, UUID sessionId, LogSetRequest req) {
        WorkoutSession session = find(userId, sessionId);
        requireInProgress(session);

        if (session.getWarmupCompletedAt() == null) {
            throw new BadRequestException("Complete your warm-up before logging sets");
        }

        if (session.getSets().size() >= MAX_SETS) {
            throw new BadRequestException("Set limit reached (" + MAX_SETS + ")");
        }

        Exercise exercise = exerciseRepository.findById(req.exerciseId())
                .filter(Exercise::isActive)
                .orElseThrow(() -> new NotFoundException("Exercise not found"));

        SessionSet set = new SessionSet();
        set.setExercise(exercise);
        validateAndApply(set, exercise.getTrackingType(),
                req.reps(), req.weightKg(), req.durationSeconds(), req.distanceMeters());

        set.setSetNumber(setRepository.countBySessionIdAndExerciseId(sessionId, exercise.getId()) + 1);
        set.setLoggedAt(Instant.now());

        session.addSet(set);
        setRepository.save(set);
        return SessionSetResponse.from(set);
    }

    @Transactional
    public SessionSetResponse updateSet(UUID userId, UUID sessionId, UUID setId, UpdateSetRequest req) {
        WorkoutSession session = find(userId, sessionId);
        requireInProgress(session);

        SessionSet set = setRepository.findByIdAndSessionId(setId, sessionId)
                .orElseThrow(() -> new NotFoundException("Set not found"));
        validateAndApply(set, set.getExercise().getTrackingType(),
                req.reps(), req.weightKg(), req.durationSeconds(), req.distanceMeters());
        return SessionSetResponse.from(set);
    }

    @Transactional
    public void deleteSet(UUID userId, UUID sessionId, UUID setId) {
        WorkoutSession session = find(userId, sessionId);
        requireInProgress(session);

        SessionSet target = session.getSets().stream()
                .filter(s -> s.getId().equals(setId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Set not found"));
        UUID exerciseId = target.getExercise().getId();

        session.getSets().remove(target); // orphanRemoval deletes the row

        List<SessionSet> remaining = session.getSets().stream()
                .filter(s -> s.getExercise().getId().equals(exerciseId))
                .sorted(Comparator.comparing(SessionSet::getLoggedAt))
                .toList();
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setSetNumber(i + 1);
        }
    }

    @Transactional
    public SessionResponse finish(UUID userId, UUID sessionId, String notes) {
        WorkoutSession session = find(userId, sessionId);
        requireInProgress(session);

        if (session.getSets().isEmpty()) {
            throw new BadRequestException("Log at least one set, or cancel the workout");
        }

        Instant now = Instant.now();
        int durationSeconds = (int) Math.min(
                Duration.between(session.getStartedAt(), now).getSeconds(), MAX_DURATION_SECONDS);

        session.setEndedAt(now);
        session.setDurationSeconds(durationSeconds);
        session.setCaloriesBurned(calorieBurnCalculator.calculate(
                session.getSets(), durationSeconds, session.getWeightKgSnapshot()));
        session.setStatus(SessionStatus.COMPLETED);
        session.setNotes(notes);

        return SessionResponse.from(session);
    }

    @Transactional
    public void cancel(UUID userId, UUID sessionId) {
        WorkoutSession session = find(userId, sessionId);
        requireInProgress(session);
        session.setStatus(SessionStatus.CANCELLED);
        session.setEndedAt(Instant.now());
    }

    private WorkoutSession find(UUID userId, UUID id) {
        return workoutSessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Workout not found"));
    }

    private void requireInProgress(WorkoutSession session) {
        if (session.getStatus() != SessionStatus.IN_PROGRESS) {
            throw new ConflictException("Workout is not in progress");
        }
    }

    private void validateAndApply(SessionSet set, TrackingType type,
                                  Integer reps, BigDecimal weightKg,
                                  Integer durationSeconds, Integer distanceMeters) {
        switch (type) {
            case REPS_WEIGHT -> {
                require(reps, "reps");
                require(weightKg, "weightKg");
                set.setReps(reps);
                set.setWeightKg(weightKg);
                set.setDurationSeconds(null);
                set.setDistanceMeters(null);
            }
            case REPS_ONLY -> {
                require(reps, "reps");
                set.setReps(reps);
                set.setWeightKg(null);
                set.setDurationSeconds(null);
                set.setDistanceMeters(null);
            }
            case DURATION -> {
                require(durationSeconds, "durationSeconds");
                set.setDurationSeconds(durationSeconds);
                set.setReps(null);
                set.setWeightKg(null);
                set.setDistanceMeters(null);
            }
            case DISTANCE_DURATION -> {
                require(durationSeconds, "durationSeconds");
                require(distanceMeters, "distanceMeters");
                set.setDurationSeconds(durationSeconds);
                set.setDistanceMeters(distanceMeters);
                set.setReps(null);
                set.setWeightKg(null);
            }
        }
    }

    private static void require(Object value, String field) {
        if (value == null) {
            throw new BadRequestException(field + " is required for this exercise");
        }
    }
    @Transactional(readOnly = true)
    public PageResponse<SessionSummaryResponse> history(UUID userId, int page, int size) {
        page = Math.max(0, page);
        size = Math.min(Math.max(1, size), 50);
        return PageResponse.from(workoutSessionRepository.findSummaries(
                userId, SessionStatus.COMPLETED, PageRequest.of(page, size)));
    }
}