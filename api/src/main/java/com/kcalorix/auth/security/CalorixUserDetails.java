package com.kcalorix.auth.security;

import com.kcalorix.user.entity.enums.Role;
import lombok.Getter;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;


public class CalorixUserDetails implements UserDetails, CredentialsContainer {

    private static final long serialVersionUID = 1L;

    @Getter
    private final UUID id;
    private final String email;
    private String password;
    private final Role role;
    private final boolean enabled;

    public CalorixUserDetails(UUID id, String email, String passwordHash, Role role, boolean enabled) {
        this.id = id;
        this.email = email;
        this.password = passwordHash;
        this.role = role;
        this.enabled = enabled;
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return email; }
    @Override public boolean isEnabled() { return enabled; }

    @Override public void eraseCredentials() { this.password = null; }
}