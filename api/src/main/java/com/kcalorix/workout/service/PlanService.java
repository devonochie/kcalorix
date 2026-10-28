package com.kcalorix.workout.service;

import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.repository.UserRepository; // adjust package
import com.kcalorix.workout.dto.*;
import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.PlanDay;
import com.kcalorix.workout.entity.PlanExercise;
import com.kcalorix.workout.entity.WorkoutPlan;
import com.kcalorix.workout.repository.ExerciseRepository;
import com.kcalorix.workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanService {

    private static final int MAX_PLANS = 20;
    private static final int DEFAULT_REST_SECONDS = 60;

    private final WorkoutPlanRepository repo;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PlanSummaryResponse> list(UUID userId) {
        return repo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId).stream()
                .map(PlanSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlanResponse get(UUID userId, UUID id) {
        return PlanResponse.from(findReadable(userId, id));
    }

    @Transactional
    public PlanResponse create(UUID userId, PlanRequest r) {
        if (repo.countByUserIdAndActiveTrue(userId) >= MAX_PLANS) {
            throw new BadRequestException("Plan limit reached (" + MAX_PLANS + ")");
        }
        WorkoutPlan plan = new WorkoutPlan();
        plan.setUser(userRepository.getReferenceById(userId));
        applyRequest(plan, r);
        return PlanResponse.from(repo.save(plan));
    }

    @Transactional
    public PlanResponse update(UUID userId, UUID id, PlanRequest r) {
        WorkoutPlan plan = find(userId, id);
        plan.getDays().clear(); // orphanRemoval deletes the old rows
        applyRequest(plan, r);
        return PlanResponse.from(repo.saveAndFlush(plan));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        WorkoutPlan plan = find(userId, id);
        plan.setActive(false); // soft delete: session history keeps working
    }

    /** Own plan first, else a system workout. Used by get only. */
    private WorkoutPlan findReadable(UUID userId, UUID id) {
        return repo.findByIdAndUserIdAndActiveTrue(id, userId)
                .or(() -> repo.findByIdAndUserIsNullAndActiveTrue(id))
                .orElseThrow(() -> new NotFoundException("Plan not found"));
    }

    private WorkoutPlan find(UUID userId, UUID id) {
        return repo.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new NotFoundException("Plan not found"));
    }

    private void applyRequest(WorkoutPlan plan, PlanRequest r) {
        plan.setName(r.name().trim());
        String desc = r.description() == null ? null : r.description().trim();
        plan.setDescription(desc == null || desc.isEmpty() ? null : desc);

        List<UUID> ids = r.days().stream()
                .flatMap(d -> d.exercises().stream())
                .map(PlanExerciseRequest::exerciseId)
                .distinct()
                .toList();
        Map<UUID, Exercise> exercises = exerciseRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Exercise::getId, Function.identity()));

        for (int dayIndex = 0; dayIndex < r.days().size(); dayIndex++) {
            PlanDayRequest dayReq = r.days().get(dayIndex);
            PlanDay day = new PlanDay();
            day.setName(dayReq.name().trim());
            day.setDayOrder(dayIndex);

            for (int exIndex = 0; exIndex < dayReq.exercises().size(); exIndex++) {
                PlanExerciseRequest exReq = dayReq.exercises().get(exIndex);
                Exercise ex = exercises.get(exReq.exerciseId());
                if (ex == null || !ex.isActive()) {
                    throw new BadRequestException("Unknown exercise: " + exReq.exerciseId());
                }
                validate(ex, exReq);

                PlanExercise pe = new PlanExercise();
                pe.setExercise(ex);
                pe.setPosition(exIndex);
                pe.setTargetSets(exReq.targetSets());
                pe.setTargetRepsMin(exReq.targetRepsMin());
                pe.setTargetRepsMax(exReq.targetRepsMax());
                pe.setTargetDurationSeconds(exReq.targetDurationSeconds());
                pe.setRestSeconds(exReq.restSeconds() != null ? exReq.restSeconds() : DEFAULT_REST_SECONDS);
                pe.setNotes(exReq.notes());
                day.addExercise(pe);
            }
            plan.addDay(day);
        }
    }

    private void validate(Exercise ex, PlanExerciseRequest req) {
        String name = ex.getName();
        switch (ex.getTrackingType()) {
            case REPS_WEIGHT, REPS_ONLY -> {
                if (req.targetRepsMin() == null || req.targetRepsMax() == null) {
                    throw new BadRequestException(name + ": reps are required");
                }
                if (req.targetRepsMin() > req.targetRepsMax()) {
                    throw new BadRequestException(name + ": min reps cannot exceed max reps");
                }
                if (req.targetDurationSeconds() != null) {
                    throw new BadRequestException(name + ": duration is not allowed for this exercise");
                }
            }
            case DURATION, DISTANCE_DURATION -> {
                if (req.targetDurationSeconds() == null) {
                    throw new BadRequestException(name + ": duration is required");
                }
                if (req.targetRepsMin() != null || req.targetRepsMax() != null) {
                    throw new BadRequestException(name + ": reps are not allowed for this exercise");
                }
            }
        }
    }
}