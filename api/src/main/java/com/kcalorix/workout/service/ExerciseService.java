package com.kcalorix.workout.service;

import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.enums.EquipmentAccess;
import com.kcalorix.user.repository.UserProfileRepository;
import com.kcalorix.workout.dto.*;
import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.enums.*;
import com.kcalorix.workout.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository repo;
    private final UserProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public PageResponse<ExerciseSummaryResponse> list(
            UUID userId, MuscleGroup muscle, ExerciseCategory category, Equipment equipment,
            Difficulty difficulty, String q, int page, int size) {

        size = Math.min(Math.max(size, 1), 50);
        page = Math.max(page, 0);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        // Only show exercises the user can do with the equipment they chose in their profile.
        Set<Equipment> allowed = profileRepository.findById(userId)
                .map(UserProfile::getEquipmentAccess)
                .map(EquipmentAccess::getAllowed)
                .orElse(null); // no profile / no choice yet = no restriction

        Specification<Exercise> spec = Specification.where(ExerciseSpecs.active())
                .and(ExerciseSpecs.equipmentIn(allowed))
                .and(ExerciseSpecs.muscle(muscle))
                .and(ExerciseSpecs.category(category))
                .and(ExerciseSpecs.equipment(equipment))
                .and(ExerciseSpecs.difficulty(difficulty))
                .and(ExerciseSpecs.nameContains(q));

        return PageResponse.from(repo.findAll(spec, pageable).map(ExerciseSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public ExerciseDetailResponse getBySlug(String slug) {
        Exercise e = repo.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new NotFoundException("Exercise not found"));
        return ExerciseDetailResponse.from(e);
    }

    public ExerciseMetaResponse meta() {
        return new ExerciseMetaResponse(
                names(ExerciseCategory.values()),
                names(MuscleGroup.values()),
                names(Equipment.values()),
                names(Difficulty.values()));
    }


    private static <E extends Enum<E>> java.util.List<String> names(E[] values) {
        return Arrays.stream(values).map(Enum::name).toList();
    }
}