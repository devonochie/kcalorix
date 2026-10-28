package com.kcalorix.auth.dto;

import com.kcalorix.user.entity.User;
import com.kcalorix.user.entity.enums.Role;

import java.util.UUID;



public record UserResponse(
        UUID id,
        String email,
        String displayName,
        Role role,
        boolean onboardingCompleted,
        boolean emailVerified
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getProfile().getDisplayName(),
                user.getRole(),
                user.getProfile().isOnboardingCompleted(),
                user.isEmailVerified()
        );
    }
}