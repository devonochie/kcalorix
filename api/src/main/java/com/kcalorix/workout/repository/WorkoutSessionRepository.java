package com.kcalorix.workout.repository;

import com.kcalorix.insights.dto.BurnedRow;
import com.kcalorix.workout.dto.SessionSummaryResponse;
import com.kcalorix.workout.entity.WorkoutSession;
import com.kcalorix.workout.entity.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    Optional<WorkoutSession> findByIdAndUserId(UUID id, UUID userId);
    Optional<WorkoutSession> findFirstByUserIdAndStatus(UUID userId, SessionStatus status);
    @Query(value = """
    select new com.kcalorix.workout.dto.SessionSummaryResponse(
        s.id, s.planName, s.dayName, s.startedAt, s.durationSeconds, s.caloriesBurned,
        (select count(ss) from SessionSet ss where ss.session = s))
    from WorkoutSession s
    where s.user.id = :userId and s.status = :status
    order by s.startedAt desc
    """,
            countQuery = "select count(s) from WorkoutSession s where s.user.id = :userId and s.status = :status")
    Page<SessionSummaryResponse> findSummaries(@Param("userId") UUID userId,
                                               @Param("status") SessionStatus status,
                                               Pageable pageable);
    @Query("""
    select new com.kcalorix.insights.dto.BurnedRow(s.startedAt, s.caloriesBurned)
    from WorkoutSession s
    where s.user.id = :userId and s.status = :status
      and s.startedAt >= :from and s.startedAt < :to
    """)
    List<BurnedRow> findBurned(@Param("userId") UUID userId, @Param("status") SessionStatus status,
                               @Param("from") Instant from, @Param("to") Instant to);
}
