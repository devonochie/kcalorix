package com.kcalorix.nutrition.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.nutrition.dto.DiaryResponse;
import com.kcalorix.nutrition.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService service;

    @GetMapping
    public DiaryResponse get(@AuthenticationPrincipal CalorixUserDetails principal,
                             @RequestParam(required = false)
                             @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.get(principal.getId(), date);
    }
}