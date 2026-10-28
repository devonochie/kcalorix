package com.kcalorix.workout.entity;

import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.workout.entity.enums.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(
        name = "exercises",
        indexes = {
                @Index(name = "idx_exercises_slug", columnList = "slug", unique = true),
                @Index(name = "idx_exercises_category", columnList = "category"),
                @Index(name = "idx_exercises_primary_muscle", columnList = "primary_muscle")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Exercise extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExerciseCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "tracking_type", nullable = false, length = 30)
    private TrackingType trackingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_muscle", nullable = false, length = 30)
    private MuscleGroup primaryMuscle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Difficulty difficulty;

    @Column(name = "met_value", nullable = false, precision = 4, scale = 2)
    private BigDecimal metValue;

    @Column(nullable = false)
    private boolean active = true;

    @Embedded
    private ExerciseMedia media;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "exercise_secondary_muscles", joinColumns = @JoinColumn(name = "exercise_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "muscle", length = 30)
    private Set<MuscleGroup> secondaryMuscles = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "exercise_steps", joinColumns = @JoinColumn(name = "exercise_id"))
    @OrderColumn(name = "position")
    @Column(name = "instruction", length = 500)
    private List<String> steps = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "exercise_tips", joinColumns = @JoinColumn(name = "exercise_id"))
    @OrderColumn(name = "position")
    @Column(name = "tip", length = 500)
    private List<String> tips = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "exercise_mistakes", joinColumns = @JoinColumn(name = "exercise_id"))
    @OrderColumn(name = "position")
    @Column(name = "mistake", length = 500)
    private List<String> commonMistakes = new ArrayList<>();
}