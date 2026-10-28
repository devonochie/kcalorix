package com.kcalorix.user.entity;

import com.kcalorix.user.entity.enums.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
public class UserProfile {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 60)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Sex sex;

    private LocalDate birthDate;

    @Column(precision = 5, scale = 2)
    private BigDecimal heightCm;

    @Column(precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(precision = 5, scale = 2)
    private BigDecimal targetWeightKg;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Goal goal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UnitSystem unitSystem = UnitSystem.METRIC;

    @Column(nullable = false, length = 60)
    private String timezone = "UTC";

    @Column(nullable = false)
    private boolean onboardingCompleted = false;

    @Column(precision = 3, scale = 2)
    private BigDecimal weeklyRateKg;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ExperienceLevel experienceLevel;

    private Integer daysPerWeek;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EquipmentAccess equipmentAccess;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}