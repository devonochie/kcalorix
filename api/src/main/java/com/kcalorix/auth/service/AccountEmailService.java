package com.kcalorix.auth.service;

import com.kcalorix.auth.dto.UserResponse;
import com.kcalorix.auth.entity.enums.AuthTokenType;
import com.kcalorix.common.exception.ConflictException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.common.exception.TooManyRequestsException;
import com.kcalorix.email.EmailService;
import com.kcalorix.user.entity.User;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.repository.UserProfileRepository;
import com.kcalorix.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;


@Service
public class AccountEmailService {

    private static final Logger log = LoggerFactory.getLogger(AccountEmailService.class);

    private final AuthTokenService authTokens;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final String frontendUrl;

    public AccountEmailService(AuthTokenService authTokens,
                               EmailService emailService,
                               UserRepository userRepository,
                               UserProfileRepository userProfileRepository,
                               @Value("${app.frontend-url}") String frontendUrl) {
        this.authTokens = authTokens;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.frontendUrl = frontendUrl;
    }

    public void sendWelcome(UserResponse u) {
        String token = authTokens.issue(u.id(), AuthTokenType.EMAIL_VERIFICATION, Duration.ofHours(24));
        emailService.sendWelcomeEmail(u.email(), u.displayName(),
                frontendUrl + "/verify-email?token=" + token);
    }

    public void resendVerification(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.isEmailVerified()) {
            throw new ConflictException("Email is already verified");
        }
        if (authTokens.recentlyIssued(userId, AuthTokenType.EMAIL_VERIFICATION)) {
            throw new TooManyRequestsException("Please wait a minute before requesting another email");
        }
        if (authTokens.dailyLimitReached(userId, AuthTokenType.EMAIL_VERIFICATION)) {
            throw new TooManyRequestsException("Daily limit reached. Try again tomorrow.");
        }

        String token = authTokens.issue(userId, AuthTokenType.EMAIL_VERIFICATION, Duration.ofHours(24));
        emailService.sendVerificationEmail(user.getEmail(), displayNameOf(userId),
                frontendUrl + "/verify-email?token=" + token);
    }

    // Never throws, so the caller can't tell an existing account from a missing one.
    public void sendPasswordReset(String rawEmail) {
        try {
            String email = rawEmail.trim().toLowerCase();
            Optional<User> found = userRepository.findByEmail(email);
            if (found.isEmpty() || !found.get().isEnabled()) {
                return;
            }
            User user = found.get();
            if (authTokens.recentlyIssued(user.getId(), AuthTokenType.PASSWORD_RESET)) {
                return;
            }
            if (authTokens.dailyLimitReached(user.getId(), AuthTokenType.PASSWORD_RESET)) {
                return;
            }

            String token = authTokens.issue(user.getId(), AuthTokenType.PASSWORD_RESET, Duration.ofMinutes(30));
            emailService.sendPasswordResetEmail(email, displayNameOf(user.getId()),
                    frontendUrl + "/reset-password?token=" + token);
        } catch (Exception e) {
            log.warn("Password reset email could not be processed", e);
        }
    }

    public void sendPasswordChanged(UserResponse u) {
        emailService.sendPasswordChangedEmail(u.email(), u.displayName());
    }

    private String displayNameOf(UUID userId) {
        return userProfileRepository.findById(userId)
                .map(UserProfile::getDisplayName)
                .orElse(null); // EmailService falls back to "there"
    }
}