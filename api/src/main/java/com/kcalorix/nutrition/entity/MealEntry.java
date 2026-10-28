package com.kcalorix.nutrition.entity;

import com.kcalorix.common.entity.BaseEntity;
import com.kcalorix.nutrition.entity.enums.MealType;
import com.kcalorix.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "meal_entries",
        indexes = @Index(name = "idx_meal_entries_user_date", columnList = "user_id, log_date"))
@Getter
@Setter
@NoArgsConstructor
public class MealEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate; // the user's local date

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    @Column(name = "fdc_id")
    private Long fdcId; // plain column, no FK

    @Column(name = "food_name", nullable = false, length = 200)
    private String foodName; // snapshot

    @Column(length = 150)
    private String brand; // snapshot

    @Column(nullable = false, precision = 7, scale = 2)
    private BigDecimal grams;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal kcal;

    @Column(name = "protein_g", nullable = false, precision = 7, scale = 2)
    private BigDecimal proteinG;

    @Column(name = "carbs_g", nullable = false, precision = 7, scale = 2)
    private BigDecimal carbsG;

    @Column(name = "fat_g", nullable = false, precision = 7, scale = 2)
    private BigDecimal fatG;
}