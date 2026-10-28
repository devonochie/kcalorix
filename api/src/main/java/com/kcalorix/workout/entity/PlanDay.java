package com.kcalorix.workout.entity;

import com.kcalorix.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plan_days")
@Getter
@Setter
@NoArgsConstructor
public class PlanDay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id")
    private WorkoutPlan plan;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(name = "day_order", nullable = false)
    private int dayOrder;

    @OneToMany(mappedBy = "planDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<PlanExercise> exercises = new ArrayList<>();

    public void addExercise(PlanExercise e) {
        exercises.add(e);
        e.setPlanDay(this);
    }
}