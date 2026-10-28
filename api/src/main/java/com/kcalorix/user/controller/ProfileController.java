package com.kcalorix.user.controller;


import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.user.dto.ProfileRequest;
import com.kcalorix.user.dto.ProfileResponse;
import com.kcalorix.user.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal CalorixUserDetails  principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getId()));

    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@AuthenticationPrincipal CalorixUserDetails principal,
                                           @Valid @RequestBody ProfileRequest profile) {
        return ResponseEntity.ok(profileService.updateProfile(principal.getId(), profile));
    }

}
