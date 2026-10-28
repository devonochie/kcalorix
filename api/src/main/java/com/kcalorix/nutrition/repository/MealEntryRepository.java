package com.kcalorix.nutrition.repository;

import com.kcalorix.insights.dto.DailyIntake;
import com.kcalorix.nutrition.entity.MealEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MealEntryRepository extends JpaRepository<MealEntry, UUID> {
    Optional<MealEntry> findByIdAndUserId(UUID id, UUID userId);
    long countByUserIdAndLogDate(UUID userId, LocalDate date);
    List<MealEntry> findByUserIdAndLogDateOrderByCreatedAtAsc(UUID userId, LocalDate date);
    @Query("""
    select new com.kcalorix.insights.dto.DailyIntake(
        m.logDate, sum(m.kcal), sum(m.proteinG), sum(m.carbsG), sum(m.fatG))
    from MealEntry m
    where m.user.id = :userId and m.logDate between :from and :to
    group by m.logDate
    """)
    List<DailyIntake> findDailyIntake(@Param("userId") UUID userId,
                                      @Param("from") LocalDate from, @Param("to") LocalDate to);
}