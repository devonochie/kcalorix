package com.kcalorix.workout.service;

import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.workout.dto.ExerciseRecordResponse;
import com.kcalorix.workout.entity.enums.SessionStatus;
import com.kcalorix.workout.repository.SessionSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final SessionSetRepository setRepository;

    @Transactional(readOnly = true)
    public List<ExerciseRecordResponse> list(UUID userId) {
        return setRepository.findRecords(userId, SessionStatus.COMPLETED);
    }

    @Transactional(readOnly = true)
    public ExerciseRecordResponse get(UUID userId, UUID exerciseId) {
        return setRepository.findRecord(userId, exerciseId, SessionStatus.COMPLETED)
                .orElseThrow(() -> new NotFoundException("No records yet for this exercise"));
    }
}