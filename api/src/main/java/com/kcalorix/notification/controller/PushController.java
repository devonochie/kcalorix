package com.kcalorix.notification.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.notification.dto.PushPublicKeyResponse;
import com.kcalorix.notification.dto.PushSubscribeRequest;
import com.kcalorix.notification.dto.PushUnsubscribeRequest;
import com.kcalorix.notification.service.PushService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications/push")
@RequiredArgsConstructor
public class PushController {

    private final PushService pushService;

    @GetMapping("/public-key")
    public PushPublicKeyResponse publicKey() {
        return new PushPublicKeyResponse(pushService.getPublicKey());
    }

    @PostMapping("/subscribe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void subscribe(@AuthenticationPrincipal CalorixUserDetails principal,
                          @Valid @RequestBody PushSubscribeRequest request) {
        pushService.subscribe(principal.getId(), request.endpoint(), request.p256dh(), request.auth());
    }

    @PostMapping("/unsubscribe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unsubscribe(@AuthenticationPrincipal CalorixUserDetails principal,
                            @Valid @RequestBody PushUnsubscribeRequest request) {
        pushService.unsubscribe(principal.getId(), request.endpoint());
    }
}