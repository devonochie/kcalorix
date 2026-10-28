package com.kcalorix.user.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.user.dto.WeightLogRequest;
import com.kcalorix.user.dto.WeightLogResponse;
import com.kcalorix.user.service.WeightLogService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/weight-logs")
public class WeightLogController {

    private final WeightLogService weightLogService;

    public WeightLogController(WeightLogService weightLogService) {
        this.weightLogService = weightLogService;
    }

    @PostMapping
    public ResponseEntity<WeightLogResponse> createWeightLog(
            @Valid @RequestBody WeightLogRequest w,
            @AuthenticationPrincipal CalorixUserDetails principal) {
        WeightLogResponse response = weightLogService.record(principal.getId(), w.date(), w.weightKg());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<WeightLogResponse>> getWeightLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal CalorixUserDetails principal) {
        return ResponseEntity.ok(weightLogService.list(principal.getId(), from, to));
    }
}