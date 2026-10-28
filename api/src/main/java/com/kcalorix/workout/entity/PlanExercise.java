package com.kcalorix.workout.entity;

import com.kcalorix.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "plan_exercises")
@Getter
@Setter
@NoArgsConstructor
public class PlanExercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_day_id")
    private PlanDay planDay;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(nullable = false)
    private int position;

    @Column(name = "target_sets", nullable = false)
    private int targetSets;

    @Column(name = "target_reps_min")
    private Integer targetRepsMin;

    @Column(name = "target_reps_max")
    private Integer targetRepsMax;

    @Column(name = "target_duration_seconds")
    private Integer targetDurationSeconds;

    @Column(name = "rest_seconds", nullable = false)
    private int restSeconds = 60;

    @Column(length = 300)
    private String notes;
}