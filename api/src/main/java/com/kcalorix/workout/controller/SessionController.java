package com.kcalorix.workout.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.workout.dto.*;
import com.kcalorix.workout.service.SessionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse start(@AuthenticationPrincipal CalorixUserDetails principal,
                                 @Valid @RequestBody StartSessionRequest request) {
        return service.start(principal.getId(), request);
    }

    @GetMapping("/active")
    public SessionResponse getActive(@AuthenticationPrincipal CalorixUserDetails principal) {
        return service.getActive(principal.getId());
    }

    @GetMapping("/{id}")
    public SessionResponse get(@AuthenticationPrincipal CalorixUserDetails principal,
                               @PathVariable UUID id) {
        return service.get(principal.getId(), id);
    }

    @PostMapping("/{id}/warmup/complete")
    public SessionResponse completeWarmup(@AuthenticationPrincipal CalorixUserDetails principal,
                                          @PathVariable UUID id) {
        return service.completeWarmup(principal.getId(), id);
    }

    @PostMapping("/{id}/sets")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionSetResponse logSet(@AuthenticationPrincipal CalorixUserDetails principal,
                                     @PathVariable UUID id,
                                     @Valid @RequestBody LogSetRequest request) {
        return service.logSet(principal.getId(), id, request);
    }

    @PutMapping("/{id}/sets/{setId}")
    public SessionSetResponse updateSet(@AuthenticationPrincipal CalorixUserDetails principal,
                                        @PathVariable UUID id,
                                        @PathVariable UUID setId,
                                        @Valid @RequestBody UpdateSetRequest request) {
        return service.updateSet(principal.getId(), id, setId, request);
    }

    @DeleteMapping("/{id}/sets/{setId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSet(@AuthenticationPrincipal CalorixUserDetails principal,
                          @PathVariable UUID id,
                          @PathVariable UUID setId) {
        service.deleteSet(principal.getId(), id, setId);
    }

    @PostMapping("/{id}/finish")
    public SessionResponse finish(@AuthenticationPrincipal CalorixUserDetails principal,
                                  @PathVariable UUID id,
                                  @RequestBody(required = false) @Valid FinishSessionRequest request) {
        String notes = request == null ? null : request.notes();
        return service.finish(principal.getId(), id, notes);
    }

    @PostMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@AuthenticationPrincipal CalorixUserDetails principal,
                       @PathVariable UUID id) {
        service.cancel(principal.getId(), id);
    }

    @GetMapping
    public PageResponse<SessionSummaryResponse> history(
            @AuthenticationPrincipal CalorixUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.history(principal.getId(), page, size);
    }
}