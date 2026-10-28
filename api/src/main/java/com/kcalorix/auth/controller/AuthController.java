package com.kcalorix.auth.controller;


import com.kcalorix.auth.dto.ForgotPasswordRequest;
import com.kcalorix.auth.dto.LoginRequest;
import com.kcalorix.auth.dto.RegisterRequest;
import com.kcalorix.auth.dto.ResetPasswordRequest;
import com.kcalorix.auth.dto.UserResponse;
import com.kcalorix.auth.dto.VerifyEmailRequest;
import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.auth.service.AccountEmailService;
import com.kcalorix.auth.service.AuthService;
import com.kcalorix.common.dto.MessageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final AccountEmailService accountEmailService;

    public AuthController(AuthService authService, AccountEmailService accountEmailService) {
        this.authService = authService;
        this.accountEmailService = accountEmailService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        UserResponse response = authService.register(registerRequest);
        accountEmailService.sendWelcome(response); // after the account is committed
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest loginRequest,
                                              HttpServletRequest req,
                                              HttpServletResponse res) {
        UserResponse response = authService.login(loginRequest, req, res);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal CalorixUserDetails principal) {
        return ResponseEntity.ok(authService.me(principal.getId()));
    }

    // POST on purpose, so email link scanners can't use up the token by opening the link
    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.token());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@AuthenticationPrincipal CalorixUserDetails principal) {
        accountEmailService.resendVerification(principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        accountEmailService.sendPasswordReset(request.email());
        return ResponseEntity.ok(new MessageResponse(
                "If an account exists for that email, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        UserResponse u = authService.resetPassword(request);
        accountEmailService.sendPasswordChanged(u);
        return ResponseEntity.ok(new MessageResponse("Password updated. Please sign in."));
    }

}