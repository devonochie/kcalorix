package com.kcalorix.workout.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.workout.dto.WorkoutDetailResponse;
import com.kcalorix.workout.dto.WorkoutSummaryResponse;
import com.kcalorix.workout.entity.enums.WorkoutCategory;
import com.kcalorix.workout.service.WorkoutCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutCatalogService service;

    @GetMapping
    public List<WorkoutSummaryResponse> list(
            @AuthenticationPrincipal CalorixUserDetails principal,
            @RequestParam(required = false) WorkoutCategory category) {
        return service.list(principal.getId(), category);
    }

    @GetMapping("/{id}")
    public WorkoutDetailResponse get(@PathVariable UUID id) {
        return service.get(id);
    }
}