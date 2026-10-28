package com.kcalorix.nutrition.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.nutrition.dto.FoodDetailResponse;
import com.kcalorix.nutrition.dto.FoodSearchItem;
import com.kcalorix.nutrition.service.FoodService;
import com.kcalorix.usage.service.UsageLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService service;
    private final UsageLimitService usageLimits;

    @GetMapping("/search")
    public PageResponse<FoodSearchItem> search(
            @AuthenticationPrincipal CalorixUserDetails principal,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "false") boolean includeBranded) {
        usageLimits.reserveFoodLookup(principal.getId());
        return service.search(query, page, includeBranded);
    }

    @GetMapping("/{fdcId}")
    public FoodDetailResponse detail(@AuthenticationPrincipal CalorixUserDetails principal,
                                     @PathVariable long fdcId) {
        usageLimits.reserveFoodLookup(principal.getId());
        return service.detail(fdcId);
    }
}