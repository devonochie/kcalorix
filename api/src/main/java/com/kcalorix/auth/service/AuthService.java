package com.kcalorix.auth.service;


import com.kcalorix.auth.dto.LoginRequest;
import com.kcalorix.auth.dto.RegisterRequest;
import com.kcalorix.auth.dto.ResetPasswordRequest;
import com.kcalorix.auth.dto.UserResponse;
import com.kcalorix.auth.entity.enums.AuthTokenType;
import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.auth.security.LoginAttemptLimiter;
import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.ConflictException;
import com.kcalorix.common.exception.TooManyRequestsException;
import com.kcalorix.user.entity.User;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.enums.Role;
import com.kcalorix.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final AuthTokenService authTokens;
    private final FindByIndexNameSessionRepository<? extends Session> sessions;
    private final LoginAttemptLimiter loginAttemptLimiter;


    public AuthService(UserRepository userRepository,  PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       SecurityContextRepository securityContextRepository,
                       AuthTokenService authTokens,
                       FindByIndexNameSessionRepository<? extends Session> sessions,
                       LoginAttemptLimiter loginAttemptLimiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.authTokens = authTokens;
        this.sessions = sessions;
        this.loginAttemptLimiter = loginAttemptLimiter;

    }

    @Transactional
    public UserResponse register(RegisterRequest r){
        String email = r.email().trim().toLowerCase();

        if(userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);

        user.setPassword(passwordEncoder.encode(r.password()));
        user.setRole(Role.USER);

        UserProfile profile = new UserProfile();
        profile.setDisplayName(r.displayName().trim());
        profile.setUser(user);

        user.setProfile(profile);

        User savedUser = userRepository.save(user);

        return  UserResponse.from(savedUser);

    }

    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest l, HttpServletRequest req, HttpServletResponse res) {
        String email  = l.email().trim().toLowerCase();

        if (loginAttemptLimiter.isBlocked(email)) {
            throw new TooManyRequestsException("Too many failed attempts. Try again in 15 minutes.");
        }

        Authentication token =
                UsernamePasswordAuthenticationToken.unauthenticated(
                        email, l.password());

        Authentication auth;
        try {
            auth = authenticationManager.authenticate(token);
        } catch (AuthenticationException e) {
            loginAttemptLimiter.recordFailure(email);
            throw e;
        }
        loginAttemptLimiter.reset(email);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, req, res);

        CalorixUserDetails details = (CalorixUserDetails) auth.getPrincipal();
        User user = userRepository.findById(details.getId()).orElseThrow();
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(UUID id) {
        User user = userRepository.findById(id).orElseThrow();
        return UserResponse.from(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        UUID userId = authTokens.consume(token, AuthTokenType.EMAIL_VERIFICATION);
        User user = userRepository.findById(userId).orElseThrow();
        user.setEmailVerified(true);
    }

    @Transactional
    public UserResponse resetPassword(ResetPasswordRequest r) {
        UUID userId = authTokens.consume(r.token(), AuthTokenType.PASSWORD_RESET);
        User user = userRepository.findById(userId).orElseThrow();
        if (!user.isEnabled()) {
            throw new BadRequestException("This link is invalid or has expired");
        }

        user.setPassword(passwordEncoder.encode(r.newPassword()));
        user.setEmailVerified(true); // opening the reset email proves the inbox is theirs

        // end every active session of this user
        sessions.findByPrincipalName(user.getEmail()).keySet().forEach(sessions::deleteById);

        return UserResponse.from(user);
    }
}