package com.kcalorix.workout.repository;

import com.kcalorix.workout.entity.WorkoutPlan;
import com.kcalorix.workout.entity.enums.WorkoutCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {
    List<WorkoutPlan> findByUserIdAndActiveTrueOrderByCreatedAtDesc(UUID userId);
    Optional<WorkoutPlan> findByIdAndUserIdAndActiveTrue(UUID uuid,  UUID userId);
    long countByUserIdAndActiveTrue(UUID userId);

    Optional<WorkoutPlan> findBySlug(String slug);
    Optional<WorkoutPlan> findByIdAndUserIsNullAndActiveTrue(UUID id);
    List<WorkoutPlan> findByUserIsNullAndActiveTrue();
    List<WorkoutPlan> findByUserIsNullAndActiveTrueAndCategory(WorkoutCategory category);
}