package com.kcalorix.workout.service;

import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.enums.ExperienceLevel;
import com.kcalorix.user.entity.enums.Goal;
import com.kcalorix.user.repository.UserProfileRepository;
import com.kcalorix.workout.dto.PlanDayRequest;
import com.kcalorix.workout.dto.PlanExerciseRequest;
import com.kcalorix.workout.dto.PlanRequest;
import com.kcalorix.workout.dto.PlanResponse;
import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.enums.*;
import com.kcalorix.workout.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static com.kcalorix.workout.entity.enums.MuscleGroup.*;

@Service
@RequiredArgsConstructor
public class PlanGeneratorService {

    private final UserProfileRepository profileRepository;
    private final ExerciseRepository exerciseRepository;
    private final PlanService planService;

    private record DayTemplate(String name, List<MuscleGroup> slots) {}

    private record Scheme(int sets, int repsMin, int repsMax, int rest) {}

    private static final List<MuscleGroup> PUSH = List.of(CHEST, CHEST, SHOULDERS, TRICEPS, ABS);
    private static final List<MuscleGroup> PULL = List.of(LATS, UPPER_BACK, BICEPS, BICEPS, ABS);
    private static final List<MuscleGroup> LEGS = List.of(QUADS, HAMSTRINGS, GLUTES, CALVES, ABS);
    private static final List<MuscleGroup> UPPER = List.of(CHEST, LATS, SHOULDERS, UPPER_BACK, BICEPS, TRICEPS);
    private static final List<MuscleGroup> LOWER = List.of(QUADS, HAMSTRINGS, GLUTES, CALVES, ABS);
    private static final List<MuscleGroup> FULL = List.of(QUADS, CHEST, LATS, HAMSTRINGS, SHOULDERS, ABS);

    @Transactional
    public PlanResponse generate(UUID userId) {
        UserProfile p = profileRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        if (p.getExperienceLevel() == null || p.getDaysPerWeek() == null
                || p.getEquipmentAccess() == null || p.getGoal() == null) {
            throw new BadRequestException("Complete your workout preferences first");
        }

        Goal goal = p.getGoal();
        Set<Equipment> equipment = p.getEquipmentAccess().getAllowed();
        Set<Difficulty> difficulties = difficultiesFor(p.getExperienceLevel());

        Map<MuscleGroup, List<Exercise>> pool = new EnumMap<>(MuscleGroup.class);
        Map<MuscleGroup, Integer> usage = new EnumMap<>(MuscleGroup.class);
        List<PlanDayRequest> days = new ArrayList<>();

        // Cardio pool (goal decides how many cardio moves each day gets; GAIN gets none).
        int cardioPerDay = cardioPerDay(goal);
        List<Exercise> cardioPool = cardioPerDay == 0 ? List.of()
                : sortForGoal(exerciseRepository.findCategoryCandidates(
                ExerciseCategory.CARDIO, equipment, difficulties), goal);

        for (DayTemplate template : splitFor(p.getDaysPerWeek())) {
            List<PlanExerciseRequest> items = new ArrayList<>();
            Set<UUID> usedToday = new HashSet<>();

            for (MuscleGroup muscle : template.slots()) {
                List<Exercise> candidates = pool.computeIfAbsent(muscle, m ->
                        sortForGoal(exerciseRepository.findCandidates(
                                ExerciseCategory.STRENGTH, m, equipment, difficulties), goal));
                Exercise pick = pick(candidates, usage, muscle, usedToday);
                if (pick == null) continue; // nothing matches this slot, skip it
                usedToday.add(pick.getId());
                items.add(toRequest(pick, goal, p.getExperienceLevel()));
            }

            // Cardio finisher(s). FULL_BODY is only used here as the rotation key, so cardio
            // changes from day to day instead of repeating the same move.
            for (int i = 0; i < cardioPerDay; i++) {
                Exercise cardio = pick(cardioPool, usage, FULL_BODY, usedToday);
                if (cardio == null) break;
                usedToday.add(cardio.getId());
                items.add(toRequest(cardio, goal, p.getExperienceLevel()));
            }

            if (!items.isEmpty()) {
                days.add(new PlanDayRequest(template.name(), items));
            }
        }

        if (days.isEmpty()) {
            throw new BadRequestException("No exercises match your equipment and level");
        }

        String name = "Auto Plan - " + p.getDaysPerWeek() + " days/week";
        String description = "Generated for goal " + goal + ", level "
                + p.getExperienceLevel() + ", equipment " + p.getEquipmentAccess()
                + ". Repeat weekly.";
        return planService.create(userId, new PlanRequest(name, description, days));
    }

    private static List<DayTemplate> splitFor(int daysPerWeek) {
        return switch (daysPerWeek) {
            case 2 -> List.of(
                    new DayTemplate("Full Body A", FULL),
                    new DayTemplate("Full Body B", FULL));
            case 3 -> List.of(
                    new DayTemplate("Full Body A", FULL),
                    new DayTemplate("Full Body B", FULL),
                    new DayTemplate("Full Body C", FULL));
            case 4 -> List.of(
                    new DayTemplate("Upper A", UPPER),
                    new DayTemplate("Lower A", LOWER),
                    new DayTemplate("Upper B", UPPER),
                    new DayTemplate("Lower B", LOWER));
            case 5 -> List.of(
                    new DayTemplate("Push", PUSH),
                    new DayTemplate("Pull", PULL),
                    new DayTemplate("Legs", LEGS),
                    new DayTemplate("Upper", UPPER),
                    new DayTemplate("Lower", LOWER));
            case 6 -> List.of(
                    new DayTemplate("Push A", PUSH),
                    new DayTemplate("Pull A", PULL),
                    new DayTemplate("Legs A", LEGS),
                    new DayTemplate("Push B", PUSH),
                    new DayTemplate("Pull B", PULL),
                    new DayTemplate("Legs B", LEGS));
            default -> throw new BadRequestException("Days per week must be between 2 and 6");
        };
    }

    private static Set<Difficulty> difficultiesFor(ExperienceLevel level) {
        return switch (level) {
            case BEGINNER -> EnumSet.of(Difficulty.BEGINNER);
            case INTERMEDIATE -> EnumSet.of(Difficulty.BEGINNER, Difficulty.INTERMEDIATE);
            case ADVANCED -> EnumSet.allOf(Difficulty.class);
        };
    }

    /** How many cardio exercises are added at the end of each training day. */
    private static int cardioPerDay(Goal goal) {
        return switch (goal) {
            case LOSE -> 2;
            case MAINTAIN -> 1;
            case GAIN -> 0;
        };
    }

    /**
     * Orders candidates best-first for the goal, so the goal decides WHICH exercises are picked:
     * LOSE   = highest energy burn (MET) first
     * GAIN   = most loadable (barbell, dumbbell, machine...) first
     * MAINTAIN = alphabetical (balanced variety)
     * Ties keep the original name order (the sort is stable).
     */
    private static List<Exercise> sortForGoal(List<Exercise> list, Goal goal) {
        List<Exercise> sorted = new ArrayList<>(list);
        sorted.sort(Comparator.comparingDouble((Exercise e) -> score(e, goal)).reversed());
        return sorted;
    }

    private static double score(Exercise e, Goal goal) {
        return switch (goal) {
            case LOSE -> e.getMetValue() == null ? 0 : e.getMetValue().doubleValue();
            case GAIN -> loadBonus(e.getEquipment()) + (e.getTrackingType() == TrackingType.REPS_WEIGHT ? 5 : 0);
            case MAINTAIN -> 0;
        };
    }

    private static double loadBonus(Equipment eq) {
        return switch (eq) {
            case BARBELL -> 10;
            case DUMBBELL -> 8;
            case MACHINE -> 6;
            case CABLE -> 5;
            default -> 0;
        };
    }

    /** Rotates through candidates so a repeated muscle (e.g. Upper A / Upper B) gets different exercises. */
    private static Exercise pick(List<Exercise> candidates, Map<MuscleGroup, Integer> usage,
                                 MuscleGroup muscle, Set<UUID> usedToday) {
        if (candidates.isEmpty()) return null;
        int start = usage.getOrDefault(muscle, 0);
        for (int i = 0; i < candidates.size(); i++) {
            Exercise e = candidates.get((start + i) % candidates.size());
            if (!usedToday.contains(e.getId())) {
                usage.put(muscle, start + i + 1);
                return e;
            }
        }
        return null;
    }

    private static Scheme schemeFor(Goal goal, ExperienceLevel level) {
        return switch (goal) {
            case LOSE -> new Scheme(3, 12, 15, 45);
            case MAINTAIN -> new Scheme(3, 8, 12, 60);
            case GAIN -> new Scheme(level == ExperienceLevel.BEGINNER ? 3 : 4, 6, 10, 90);
        };
    }

    private static PlanExerciseRequest toRequest(Exercise ex, Goal goal, ExperienceLevel level) {
        Scheme s = schemeFor(goal, level);
        return switch (ex.getTrackingType()) {
            case REPS_WEIGHT, REPS_ONLY ->
                    new PlanExerciseRequest(ex.getId(), s.sets(), s.repsMin(), s.repsMax(), null, s.rest(), null);
            case DURATION, DISTANCE_DURATION ->
                    new PlanExerciseRequest(ex.getId(), s.sets(), null, null, durationFor(level), s.rest(), null);
        };
    }

    private static int durationFor(ExperienceLevel level) {
        return switch (level) {
            case BEGINNER -> 30;
            case INTERMEDIATE -> 45;
            case ADVANCED -> 60;
        };
    }
}