package com.kcalorix.workout.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.workout.dto.ExerciseDetailResponse;
import com.kcalorix.workout.dto.ExerciseMetaResponse;
import com.kcalorix.workout.dto.ExerciseSummaryResponse;
import com.kcalorix.workout.dto.RecommendationsResponse;
import com.kcalorix.workout.entity.enums.*;
import com.kcalorix.workout.service.ExerciseRecommendationService;
import com.kcalorix.workout.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/exercises") // adjust to your API prefix
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService service;
    private final ExerciseRecommendationService recommendationService;

    @GetMapping
    public PageResponse<ExerciseSummaryResponse> list(
            @AuthenticationPrincipal CalorixUserDetails principal,
            @RequestParam(required = false) MuscleGroup muscle,
            @RequestParam(required = false) ExerciseCategory category,
            @RequestParam(required = false) Equipment equipment,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.list(principal.getId(), muscle, category, equipment, difficulty, q, page, size);
    }

    @GetMapping("/meta")
    public ExerciseMetaResponse meta() {
        return service.meta();
    }

    @GetMapping("/recommended")
    public RecommendationsResponse recommended(@AuthenticationPrincipal CalorixUserDetails principal) {
        return recommendationService.recommend(principal.getId());
    }

    @GetMapping("/{slug}")
    public ExerciseDetailResponse getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug);
    }
}