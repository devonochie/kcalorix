package com.kcalorix.workout.entity;

import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.user.entity.User;
import com.kcalorix.workout.entity.enums.Difficulty;
import com.kcalorix.workout.entity.enums.WorkoutCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_plans")
@Getter
@Setter
@NoArgsConstructor
public class WorkoutPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY) // null user = system workout
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 80, unique = true)
    private String slug;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private WorkoutCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Difficulty level;

    @Column(nullable = false)
    private boolean active = true; // soft delete

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayOrder ASC")
    private List<PlanDay> days = new ArrayList<>();

    public void addDay(PlanDay d) {
        days.add(d);
        d.setPlan(this);
    }
}