package com.kcalorix.notification.dto;

/** publicKey is empty when push is not configured on the server. */
public record PushPublicKeyResponse(String publicKey) {}