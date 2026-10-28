package com.kcalorix.nutrition.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.nutrition.dto.AddMealBatchRequest;
import com.kcalorix.nutrition.dto.AddMealEntryRequest;
import com.kcalorix.nutrition.dto.MealEntryResponse;
import com.kcalorix.nutrition.dto.UpdateMealEntryRequest;
import com.kcalorix.nutrition.service.MealService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealEntryResponse add(@AuthenticationPrincipal CalorixUserDetails principal,
                                 @Valid @RequestBody AddMealEntryRequest request) {
        return service.add(principal.getId(), request);
    }

    @PutMapping("/{id}")
    public MealEntryResponse update(@AuthenticationPrincipal CalorixUserDetails principal,
                                    @PathVariable UUID id,
                                    @Valid @RequestBody UpdateMealEntryRequest request) {
        return service.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal CalorixUserDetails principal,
                       @PathVariable UUID id) {
        service.delete(principal.getId(), id);
    }

    @PostMapping("/batch")
    @ResponseStatus(HttpStatus.CREATED)
    public List<MealEntryResponse> addBatch(@AuthenticationPrincipal CalorixUserDetails principal,
                                            @Valid @RequestBody AddMealBatchRequest request) {
        return service.addBatch(principal.getId(), request);
    }
}