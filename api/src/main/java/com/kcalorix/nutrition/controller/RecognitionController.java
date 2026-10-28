package com.kcalorix.nutrition.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.nutrition.dto.RecognitionResponse;
import com.kcalorix.nutrition.service.RecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/recognition")
@RequiredArgsConstructor
public class RecognitionController {

    private final RecognitionService service;

    @PostMapping(value = "/detect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RecognitionResponse detect(@AuthenticationPrincipal CalorixUserDetails principal,
                                      @RequestPart(name = "image", required = false) MultipartFile image) {
        return service.detect(principal.getId(), image);
    }
}