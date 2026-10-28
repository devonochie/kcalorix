package com.kcalorix.insights.controller;


import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.insights.dto.DailyBalanceResponse;
import com.kcalorix.insights.dto.TargetsResponse;
import com.kcalorix.insights.dto.TrendsResponse;
import com.kcalorix.insights.service.BalanceService;
import com.kcalorix.insights.service.TargetService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;


@RestController
@RequestMapping("/api/v1/insights")
public class InsightsController {
    private final TargetService targetService;
    private final BalanceService balanceService;

    public InsightsController(TargetService targetService,  BalanceService balanceService) {
        this.targetService = targetService;
        this.balanceService = balanceService;
    }

    @GetMapping("/targets")
    public ResponseEntity<TargetsResponse> getTargets(@AuthenticationPrincipal CalorixUserDetails principal) {
        return ResponseEntity.ok(targetService.getTargets(principal.getId()));

    }

    @GetMapping("/balance")
    public DailyBalanceResponse balance(
            @AuthenticationPrincipal CalorixUserDetails principal,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return balanceService.daily(principal.getId(), date);
    }

    @GetMapping("/trends")
    public TrendsResponse trends(
            @AuthenticationPrincipal CalorixUserDetails principal,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return balanceService.trends(principal.getId(), days, end);
    }
}
