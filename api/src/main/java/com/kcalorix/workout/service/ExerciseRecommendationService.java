package com.kcalorix.workout.service;

import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.enums.EquipmentAccess;
import com.kcalorix.user.entity.enums.ExperienceLevel;
import com.kcalorix.user.entity.enums.Goal;
import com.kcalorix.user.repository.UserProfileRepository;
import com.kcalorix.workout.dto.ExerciseSummaryResponse;
import com.kcalorix.workout.dto.RecommendationsResponse;
import com.kcalorix.workout.dto.RecommendedExerciseResponse;
import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.enums.Difficulty;
import com.kcalorix.workout.entity.enums.Equipment;
import com.kcalorix.workout.entity.enums.ExerciseCategory;
import com.kcalorix.workout.entity.enums.MuscleGroup;
import com.kcalorix.workout.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static com.kcalorix.workout.entity.enums.MuscleGroup.*;

/** Ranks the exercise library for one user: by their goal, filtered by their level and equipment. */
@Service
@RequiredArgsConstructor
public class ExerciseRecommendationService {

    private static final int LIMIT = 12;
    private static final int PER_MUSCLE = 2;
    private static final Set<MuscleGroup> BIG =
            EnumSet.of(QUADS, GLUTES, HAMSTRINGS, CHEST, LATS, UPPER_BACK, FULL_BODY);

    private final UserProfileRepository profileRepository;
    private final ExerciseRepository exerciseRepository;

    @Transactional(readOnly = true)
    public RecommendationsResponse recommend(UUID userId) {
        UserProfile p = profileRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        if (p.getGoal() == null) {
            throw new BadRequestException("Finish onboarding first");
        }

        Goal goal = p.getGoal();
        ExperienceLevel level = p.getExperienceLevel() != null ? p.getExperienceLevel() : ExperienceLevel.BEGINNER;
        EquipmentAccess access = p.getEquipmentAccess() != null ? p.getEquipmentAccess() : EquipmentAccess.GYM;

        Set<Equipment> equipment = access.getAllowed();
        List<Exercise> pool = exerciseRepository.findForRecommendation(equipment, difficultiesFor(level));

        List<Exercise> ranked = pool.stream()
                .filter(e -> score(e, goal) > 0)
                .sorted(Comparator.comparingDouble((Exercise e) -> score(e, goal)).reversed()
                        .thenComparing(Exercise::getName))
                .toList();

        // Keep it varied: a few exercises per muscle, and a capped number of cardio picks.
        Map<String, Integer> perBucket = new HashMap<>();
        List<RecommendedExerciseResponse> items = new ArrayList<>();
        for (Exercise e : ranked) {
            boolean cardio = e.getCategory() == ExerciseCategory.CARDIO;
            String bucket = cardio ? "CARDIO" : e.getPrimaryMuscle().name();
            int cap = cardio ? cardioCap(goal) : PER_MUSCLE;
            if (perBucket.merge(bucket, 1, Integer::sum) > cap) continue;

            items.add(new RecommendedExerciseResponse(ExerciseSummaryResponse.from(e), reason(e, goal)));
            if (items.size() == LIMIT) break;
        }
        return new RecommendationsResponse(goal, headline(goal), items);
    }

    private static double score(Exercise e, Goal goal) {
        double met = e.getMetValue().doubleValue();
        boolean big = BIG.contains(e.getPrimaryMuscle());
        ExerciseCategory cat = e.getCategory();
        return switch (goal) {
            // Fat loss: burn the most energy. Cardio and big-muscle lifts first.
            case LOSE -> cat == ExerciseCategory.FLEXIBILITY ? 0
                    : met * 10 + (big ? 20 : 0) + (cat == ExerciseCategory.CARDIO ? 15 : 0);
            // Muscle gain: loadable strength work, big compound movements first.
            case GAIN -> cat != ExerciseCategory.STRENGTH ? 0
                    : 50 + (big ? 30 : e.getPrimaryMuscle() == SHOULDERS ? 15 : 0) + loadBonus(e.getEquipment());
            // Maintain: a balanced mix.
            case MAINTAIN -> cat == ExerciseCategory.FLEXIBILITY ? 0
                    : 20 + met * 5 + (big ? 10 : 0);
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

    private static int cardioCap(Goal goal) {
        return switch (goal) {
            case LOSE -> 4;
            case MAINTAIN -> 2;
            case GAIN -> 0;
        };
    }

    private static String reason(Exercise e, Goal goal) {
        String muscle = e.getPrimaryMuscle().name().toLowerCase().replace('_', ' ');
        boolean cardio = e.getCategory() == ExerciseCategory.CARDIO;
        boolean big = BIG.contains(e.getPrimaryMuscle());
        return switch (goal) {
            case LOSE -> cardio ? "Burns a lot of calories per minute"
                    : big ? "Works big muscles, so you burn more energy"
                      : "Keeps your " + muscle + " strong while you cut";
            case GAIN -> big ? "Heavy compound lift for your " + muscle
                    : "Adds size to your " + muscle;
            case MAINTAIN -> cardio ? "Keeps your heart and lungs in shape"
                    : "Keeps your " + muscle + " strong";
        };
    }

    private static String headline(Goal goal) {
        return switch (goal) {
            case LOSE -> "Picked to help you burn more energy and keep your muscle";
            case GAIN -> "Picked to help you build muscle";
            case MAINTAIN -> "Picked to keep you balanced and strong";
        };
    }

    private static Set<Difficulty> difficultiesFor(ExperienceLevel level) {
        return switch (level) {
            case BEGINNER -> EnumSet.of(Difficulty.BEGINNER);
            case INTERMEDIATE -> EnumSet.of(Difficulty.BEGINNER, Difficulty.INTERMEDIATE);
            case ADVANCED -> EnumSet.allOf(Difficulty.class);
        };
    }
}