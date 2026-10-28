package com.kcalorix.workout.repository;

import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.enums.Difficulty;
import com.kcalorix.workout.entity.enums.Equipment;
import com.kcalorix.workout.entity.enums.ExerciseCategory;
import com.kcalorix.workout.entity.enums.MuscleGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID>, JpaSpecificationExecutor<Exercise> {
    Optional<Exercise> findBySlugAndActiveTrue(String slug);
    Optional<Exercise> findBySlug(String slug);

    @Query("""
            select e from Exercise e
            where e.active = true
              and e.category = :category
              and e.primaryMuscle = :muscle
              and e.equipment in :equipment
              and e.difficulty in :difficulties
            order by e.name asc
            """)
    List<Exercise> findCandidates(@Param("category") ExerciseCategory category,
                                  @Param("muscle") MuscleGroup muscle,
                                  @Param("equipment") Collection<Equipment> equipment,
                                  @Param("difficulties") Collection<Difficulty> difficulties);

    /** Same as findCandidates but for a whole category (used for cardio, whose primary muscle varies). */
    @Query("""
            select e from Exercise e
            where e.active = true
              and e.category = :category
              and e.equipment in :equipment
              and e.difficulty in :difficulties
            order by e.name asc
            """)
    List<Exercise> findCategoryCandidates(@Param("category") ExerciseCategory category,
                                          @Param("equipment") Collection<Equipment> equipment,
                                          @Param("difficulties") Collection<Difficulty> difficulties);

    @Query("""
            select e from Exercise e
            where e.active = true
              and e.category <> com.kcalorix.workout.entity.enums.ExerciseCategory.WARMUP
              and e.equipment in :equipment
              and e.difficulty in :difficulties
            """)
    List<Exercise> findForRecommendation(@Param("equipment") Collection<Equipment> equipment,
                                         @Param("difficulties") Collection<Difficulty> difficulties);
}