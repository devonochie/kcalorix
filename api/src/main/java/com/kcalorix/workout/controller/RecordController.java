package com.kcalorix.workout.controller;


import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.workout.dto.ExerciseRecordResponse;
import com.kcalorix.workout.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService service;

    @GetMapping
    public List<ExerciseRecordResponse> list(@AuthenticationPrincipal CalorixUserDetails principal) {
        return service.list(principal.getId());
    }

    @GetMapping("/{exerciseId}")
    public ExerciseRecordResponse get(@AuthenticationPrincipal CalorixUserDetails principal,
                                      @PathVariable UUID exerciseId) {
        return service.get(principal.getId(), exerciseId);
    }
}