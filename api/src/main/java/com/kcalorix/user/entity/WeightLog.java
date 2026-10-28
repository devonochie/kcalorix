package com.kcalorix.user.entity;


import com.kcalorix.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;


@Entity
@Table(name = "weight_logs", uniqueConstraints = @UniqueConstraint(
        name = "uk_weight_logs_user_date",
        columnNames = {"user_id", "log_date"})
)
@Getter
@Setter
@NoArgsConstructor
public class WeightLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "weight_kg", nullable = false, precision = 5, scale = 2)
    private BigDecimal weightKg;

}
