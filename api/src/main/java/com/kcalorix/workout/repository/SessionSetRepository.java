package com.kcalorix.workout.repository;

import com.kcalorix.workout.dto.ExerciseRecordResponse;
import com.kcalorix.workout.entity.SessionSet;
import com.kcalorix.workout.entity.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionSetRepository extends JpaRepository<SessionSet, UUID> {
    Optional<SessionSet> findByIdAndSessionId(UUID id, UUID sessionId);
    int countBySessionIdAndExerciseId(UUID sessionId, UUID exerciseId);
    @Query("""
    select new com.kcalorix.workout.dto.ExerciseRecordResponse(
        e.id, e.name, e.trackingType,
        max(ss.weightKg),
        max(case when ss.reps = 1 then cast(ss.weightKg as double)
                 else cast(ss.weightKg * (1 + ss.reps / 30.0) as double) end),
        max(ss.reps), max(ss.durationSeconds), max(ss.distanceMeters))
    from SessionSet ss join ss.exercise e
    where ss.session.user.id = :userId and ss.session.status = :status
    group by e.id, e.name, e.trackingType
    order by e.name
    """)
    List<ExerciseRecordResponse> findRecords(@Param("userId") UUID userId,
                                             @Param("status") SessionStatus status);

    @Query("""
    select new com.kcalorix.workout.dto.ExerciseRecordResponse(
        e.id, e.name, e.trackingType,
        max(ss.weightKg),
        max(case when ss.reps = 1 then cast(ss.weightKg as double)
                 else cast(ss.weightKg * (1 + ss.reps / 30.0) as double) end),
        max(ss.reps), max(ss.durationSeconds), max(ss.distanceMeters))
    from SessionSet ss join ss.exercise e
    where ss.session.user.id = :userId and ss.session.status = :status
      and e.id = :exerciseId
    group by e.id, e.name, e.trackingType
    """)
    Optional<ExerciseRecordResponse> findRecord(@Param("userId") UUID userId,
                                                @Param("exerciseId") UUID exerciseId,
                                                @Param("status") SessionStatus status);
}
