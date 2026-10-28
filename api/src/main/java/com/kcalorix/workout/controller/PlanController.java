package com.kcalorix.workout.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.workout.dto.PlanRequest;
import com.kcalorix.workout.dto.PlanResponse;
import com.kcalorix.workout.dto.PlanSummaryResponse;
import com.kcalorix.workout.service.PlanGeneratorService;
import com.kcalorix.workout.service.PlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService service;
    private final PlanGeneratorService generator;

    @GetMapping
    public List<PlanSummaryResponse> list(@AuthenticationPrincipal CalorixUserDetails principal) {
        return service.list(principal.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlanResponse create(@AuthenticationPrincipal CalorixUserDetails principal,
                               @Valid @RequestBody PlanRequest request) {
        return service.create(principal.getId(), request);
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public PlanResponse generate(@AuthenticationPrincipal CalorixUserDetails principal) {
        return generator.generate(principal.getId());
    }

    @GetMapping("/{id}")
    public PlanResponse get(@AuthenticationPrincipal CalorixUserDetails principal,
                            @PathVariable UUID id) {
        return service.get(principal.getId(), id);
    }

    @PutMapping("/{id}")
    public PlanResponse update(@AuthenticationPrincipal CalorixUserDetails principal,
                               @PathVariable UUID id,
                               @Valid @RequestBody PlanRequest request) {
        return service.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal CalorixUserDetails principal,
                       @PathVariable UUID id) {
        service.delete(principal.getId(), id);
    }
}