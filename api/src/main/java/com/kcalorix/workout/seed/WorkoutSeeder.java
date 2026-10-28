package com.kcalorix.workout.seed;

import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.PlanDay;
import com.kcalorix.workout.entity.PlanExercise;
import com.kcalorix.workout.entity.WorkoutPlan;
import com.kcalorix.workout.repository.ExerciseRepository;
import com.kcalorix.workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "calorix.seed.workouts", havingValue = "true", matchIfMissing = true)
public class WorkoutSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(WorkoutSeeder.class);

    private final WorkoutPlanRepository repo;
    private final ExerciseRepository exerciseRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(@NonNull ApplicationArguments args) throws Exception {
        List<WorkoutSeedItem> items;
        try (InputStream in = new ClassPathResource("seed/workouts.json").getInputStream()) {
            items = objectMapper.readValue(in, new TypeReference<>() {
            });
        }

        for (WorkoutSeedItem item : items) {
            WorkoutPlan plan = repo.findBySlug(item.slug()).orElseGet(WorkoutPlan::new);

            plan.setUser(null);
            plan.setSlug(item.slug());
            plan.setName(item.name());
            plan.setDescription(item.description());
            plan.setCategory(item.category());
            plan.setLevel(item.level());
            plan.setActive(true);
            plan.getDays().clear();

            PlanDay day = new PlanDay();
            day.setName(item.name());
            day.setDayOrder(0);

            for (int i = 0; i < item.exercises().size(); i++) {
                WorkoutSeedItem.Entry entry = item.exercises().get(i);
                Exercise ex = exerciseRepository.findBySlug(entry.exercise())
                        .orElseThrow(() -> new IllegalStateException("Unknown exercise: " + entry.exercise()));

                PlanExercise pe = new PlanExercise();
                pe.setExercise(ex);
                pe.setPosition(i);
                pe.setTargetSets(entry.sets());
                pe.setTargetRepsMin(entry.reps());
                pe.setTargetRepsMax(entry.reps());
                pe.setTargetDurationSeconds(entry.durationSeconds());
                pe.setRestSeconds(item.restSeconds());
                day.addExercise(pe);
            }
            plan.addDay(day);
            repo.save(plan);
        }

        // Switch off system workouts that are no longer in the JSON (e.g. the old Upper/Lower Body ones).
        Set<String> seededSlugs = items.stream().map(WorkoutSeedItem::slug).collect(Collectors.toSet());
        repo.findByUserIsNullAndActiveTrue().stream()
                .filter(p -> !seededSlugs.contains(p.getSlug()))
                .forEach(p -> p.setActive(false));

        log.info("Seeded/updated {} workouts", items.size());
    }
}