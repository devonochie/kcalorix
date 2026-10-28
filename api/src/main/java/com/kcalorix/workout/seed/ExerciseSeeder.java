package com.kcalorix.workout.seed;

import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.ExerciseMedia;
import com.kcalorix.workout.repository.ExerciseRepository;

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

@Component
@Order(1)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "calorix.seed.exercises", havingValue = "true", matchIfMissing = true)
public class ExerciseSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ExerciseSeeder.class);

    private final ExerciseRepository repo;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(@NonNull ApplicationArguments args) throws Exception {
        List<ExerciseSeedItem> items;
        try (InputStream in = new ClassPathResource("seed/exercises.json").getInputStream()) {
            items = objectMapper.readValue(in, new TypeReference<>() {
            });
        }

        for (ExerciseSeedItem item : items) {
            Exercise e = repo.findBySlug(item.slug()).orElseGet(Exercise::new);

            e.setSlug(item.slug());
            e.setName(item.name());
            e.setDescription(item.description());
            e.setCategory(item.category());
            e.setTrackingType(item.trackingType());
            e.setPrimaryMuscle(item.primaryMuscle());
            e.setEquipment(item.equipment());
            e.setDifficulty(item.difficulty());
            e.setMetValue(item.metValue());
            e.setMedia(new ExerciseMedia(item.videoPath(), item.thumbnailPath(), item.animationKey()));

            e.getSecondaryMuscles().clear();
            if (item.secondaryMuscles() != null) e.getSecondaryMuscles().addAll(item.secondaryMuscles());
            e.getSteps().clear();
            if (item.steps() != null) e.getSteps().addAll(item.steps());
            e.getTips().clear();
            if (item.tips() != null) e.getTips().addAll(item.tips());
            e.getCommonMistakes().clear();
            if (item.commonMistakes() != null) e.getCommonMistakes().addAll(item.commonMistakes());

            repo.save(e);
        }
        log.info("Seeded/updated {} exercises", items.size());
    }
}