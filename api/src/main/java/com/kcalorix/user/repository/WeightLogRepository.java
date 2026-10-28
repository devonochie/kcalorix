package com.kcalorix.user.repository;

import com.kcalorix.user.entity.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeightLogRepository extends JpaRepository<WeightLog, UUID> {
    Optional<WeightLog> findByUserIdAndLogDate(UUID userId, LocalDate d);
    List<WeightLog> findByUserIdAndLogDateBetweenOrderByLogDateAsc(UUID userId, LocalDate from, LocalDate to);
    boolean existsByUserIdAndLogDateAfter(UUID userId, LocalDate d);
}