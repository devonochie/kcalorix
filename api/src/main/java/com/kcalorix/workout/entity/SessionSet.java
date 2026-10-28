package com.kcalorix.workout.entity;


import com.kcalorix.common.entity.BaseEntity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.math.BigDecimal;
import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "session_sets",
        indexes = @Index(name = "idx_session_sets_exercise", columnList = "exercise_id"))
@Getter
@Setter
@NoArgsConstructor
public class SessionSet extends BaseEntity {
    @ManyToOne(fetch = LAZY, optional=false)
    @JoinColumn(name="session_id")
    private WorkoutSession session;

    @ManyToOne(fetch = LAZY, optional=false)
    @JoinColumn(name="exercise_id")
    private Exercise exercise;

    @Column(name="set_number", nullable=false)
    private int setNumber;

    @Column
    private Integer reps;

    @Column(name="weight_kg", precision=6, scale=2)
    private BigDecimal weightKg;

    @Column(name="duration_seconds")
    private Integer durationSeconds;

    @Column(name="distance_meters")
    private Integer distanceMeters;

    @Column(name="logged_at", nullable=false)
    private Instant loggedAt;


}
