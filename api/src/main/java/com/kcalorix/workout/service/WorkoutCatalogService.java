package com.kcalorix.workout.service;

import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.repository.UserProfileRepository;
import com.kcalorix.workout.dto.PlanExerciseResponse;
import com.kcalorix.workout.dto.WorkoutDetailResponse;
import com.kcalorix.workout.dto.WorkoutSummaryResponse;
import com.kcalorix.workout.entity.PlanDay;
import com.kcalorix.workout.entity.PlanExercise;
import com.kcalorix.workout.entity.WorkoutPlan;
import com.kcalorix.workout.entity.enums.Difficulty;
import com.kcalorix.workout.entity.enums.Equipment;
import com.kcalorix.workout.entity.enums.WorkoutCategory;
import com.kcalorix.workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkoutCatalogService {

    private static final int SECONDS_PER_REP = 3;

    private final WorkoutPlanRepository repo;
    private final UserProfileRepository profileRepository;

    /**
     * Premade workouts that fit this user: every exercise must use equipment they have,
     * and the workout level can't be above their experience level.
     * If the user hasn't set equipment or level yet, that filter is skipped.
     */
    @Transactional(readOnly = true)
    public List<WorkoutSummaryResponse> list(UUID userId, WorkoutCategory category) {
        UserProfile profile = profileRepository.findById(userId).orElse(null);
        Set<Equipment> allowed = profile == null || profile.getEquipmentAccess() == null
                ? null : profile.getEquipmentAccess().getAllowed();
        Difficulty maxLevel = profile == null || profile.getExperienceLevel() == null
                ? null : Difficulty.valueOf(profile.getExperienceLevel().name());

        List<WorkoutPlan> plans = category == null
                ? repo.findByUserIsNullAndActiveTrue()
                : repo.findByUserIsNullAndActiveTrueAndCategory(category);
        return plans.stream()
                .filter(p -> fitsLevel(p, maxLevel))
                .filter(p -> fitsEquipment(p, allowed))
                .map(this::toSummary)
                .sorted(Comparator.comparing(
                                (WorkoutSummaryResponse w) -> w.level() == null ? Integer.MAX_VALUE : w.level().ordinal())
                        .thenComparing(WorkoutSummaryResponse::name))
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutDetailResponse get(UUID id) {
        WorkoutPlan plan = repo.findByIdAndUserIsNullAndActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("Workout not found"));
        PlanDay day = firstDay(plan);
        List<PlanExerciseResponse> exercises = day == null ? List.of()
                : day.getExercises().stream().map(PlanExerciseResponse::from).toList();
        return new WorkoutDetailResponse(toSummary(plan), exercises);
    }

    private boolean fitsLevel(WorkoutPlan p, Difficulty maxLevel) {
        if (maxLevel == null || p.getLevel() == null) return true;
        return p.getLevel().ordinal() <= maxLevel.ordinal();
    }

    private boolean fitsEquipment(WorkoutPlan p, Set<Equipment> allowed) {
        if (allowed == null) return true;
        PlanDay day = firstDay(p);
        if (day == null) return true;
        return day.getExercises().stream()
                .allMatch(pe -> allowed.contains(pe.getExercise().getEquipment()));
    }

    private WorkoutSummaryResponse toSummary(WorkoutPlan p) {
        PlanDay day = firstDay(p);
        List<PlanExercise> exercises = day == null ? List.of() : day.getExercises();
        return new WorkoutSummaryResponse(
                p.getId(),
                day == null ? null : day.getId(),
                p.getSlug(),
                p.getName(),
                p.getDescription(),
                p.getCategory(),
                p.getLevel(),
                estimatedMinutes(exercises),
                exercises.size());
    }

    private PlanDay firstDay(WorkoutPlan p) {
        return p.getDays().isEmpty() ? null : p.getDays().get(0);
    }

    private int estimatedMinutes(List<PlanExercise> exercises) {
        long seconds = 0;
        for (PlanExercise pe : exercises) {
            int work = pe.getTargetDurationSeconds() != null
                    ? pe.getTargetDurationSeconds()
                    : (pe.getTargetRepsMin() == null ? 0 : pe.getTargetRepsMin()) * SECONDS_PER_REP;
            seconds += (long) pe.getTargetSets() * (work + pe.getRestSeconds());
        }
        return (int) Math.max(1, Math.round(seconds / 60.0));
    }
}