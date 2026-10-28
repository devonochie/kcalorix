package com.kcalorix.workout.entity;


import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.user.entity.User;
import com.kcalorix.workout.entity.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static jakarta.persistence.CascadeType.ALL;
import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.FetchType.LAZY;


@Entity
@Table(name = "workout_sessions",
        indexes = @Index(name = "idx_sessions_user_started", columnList = "user_id, started_at"))

@Getter
@Setter
@NoArgsConstructor
public class WorkoutSession extends BaseEntity {
    @ManyToOne(fetch = LAZY, optional=false)
    @JoinColumn(name="user_id")
    private User user;

    @Column(name="plan_id")
    private UUID planId;

    @Column(name="plan_name", length=100)
    private String planName;

    @Column(name="day_name", length=60)
    private String dayName;

    @Enumerated(STRING)
    @Column(nullable=false, length=20)
    private SessionStatus status;

    @Column(name="started_at", nullable=false)
    private Instant startedAt;

    @Column(name="warmup_completed_at")
    private Instant warmupCompletedAt;

    @Column(name="ended_at")
    private Instant endedAt;
    @Column(name="duration_seconds")
    private Integer durationSeconds;

    @Column(name="weight_kg_snapshot", nullable=false, precision=5, scale=2)
    private BigDecimal weightKgSnapshot;

    @Column(name="calories_burned")
    private Integer caloriesBurned;

    @Column(length=500)
    private String notes;

    @OneToMany(mappedBy="session", cascade=ALL, orphanRemoval=true)
    @OrderBy("loggedAt ASC")
    private List<SessionSet> sets = new ArrayList<>();

    public void addSet(SessionSet s) {
        sets.add(s);
        s.setSession(this);
    }

}