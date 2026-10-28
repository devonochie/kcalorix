package com.kcalorix.notification.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.notification.dto.NotificationResponse;
import com.kcalorix.notification.dto.PreferencesResponse;
import com.kcalorix.notification.dto.UnreadCountResponse;
import com.kcalorix.notification.dto.UpdatePreferencesRequest;
import com.kcalorix.notification.service.NotificationPreferenceService;
import com.kcalorix.notification.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationPreferenceService preferenceService;
    private final NotificationService notificationService;

    @GetMapping("/preferences")
    public PreferencesResponse getPreferences(@AuthenticationPrincipal CalorixUserDetails principal) {
        return preferenceService.get(principal.getId());
    }

    @PutMapping("/preferences")
    public PreferencesResponse updatePreferences(@AuthenticationPrincipal CalorixUserDetails principal,
                                                 @Valid @RequestBody UpdatePreferencesRequest request) {
        return preferenceService.update(principal.getId(), request);
    }

    @GetMapping
    public PageResponse<NotificationResponse> list(
            @AuthenticationPrincipal CalorixUserDetails principal,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.list(principal.getId(), unreadOnly, page, size);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(@AuthenticationPrincipal CalorixUserDetails principal) {
        return notificationService.unreadCount(principal.getId());
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@AuthenticationPrincipal CalorixUserDetails principal,
                         @PathVariable UUID id) {
        notificationService.markRead(principal.getId(), id);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal CalorixUserDetails principal) {
        notificationService.markAllRead(principal.getId());
    }
}