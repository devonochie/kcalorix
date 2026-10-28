package com.kcalorix.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** The subscription the browser gives us: an endpoint URL and two keys. */
public record PushSubscribeRequest(
        @NotBlank @Size(max = 1000) String endpoint,
        @NotBlank @Size(max = 200) String p256dh,
        @NotBlank @Size(max = 100) String auth) {}