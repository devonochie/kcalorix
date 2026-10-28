package com.kcalorix.notification.service;

import com.kcalorix.notification.entity.PushSubscription;
import com.kcalorix.notification.repository.PushSubscriptionRepository;
import com.kcalorix.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.security.Security;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Sends Web Push messages. Does nothing (and the app keeps working) if the VAPID keys are not set.
 * Generate keys once:  npx web-push generate-vapid-keys
 */
@Service
@RequiredArgsConstructor
public class PushService {

    private static final Logger log = LoggerFactory.getLogger(PushService.class);

    private final PushSubscriptionRepository repository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${calorix.push.public-key:}")
    private String publicKey;
    @Value("${calorix.push.private-key:}")
    private String privateKey;
    @Value("${calorix.push.subject:mailto:admin@example.com}")
    private String subject;

    private nl.martijndwars.webpush.PushService client;

    @PostConstruct
    void init() {
        if (publicKey.isBlank() || privateKey.isBlank()) {
            log.warn("Push disabled: calorix.push.public-key / private-key are not set");
            return;
        }
        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            client = new nl.martijndwars.webpush.PushService(publicKey, privateKey, subject);
        } catch (Exception e) {
            log.error("Push disabled: could not start the push client", e);
        }
    }

    public String getPublicKey() {
        return client != null ? publicKey : "";
    }

    @Transactional
    public void subscribe(UUID userId, String endpoint, String p256dh, String auth) {
        PushSubscription s = repository.findByEndpoint(endpoint).orElseGet(PushSubscription::new);
        // same device, new account (or a refreshed key): the subscription follows the latest login
        s.setUser(userRepository.getReferenceById(userId));
        s.setEndpoint(endpoint);
        s.setP256dh(p256dh);
        s.setAuthKey(auth);
        repository.save(s);
    }

    @Transactional
    public void unsubscribe(UUID userId, String endpoint) {
        repository.deleteByEndpointAndUserId(endpoint, userId);
    }

    /** Sends to every device of the user. Never throws: a push failure must not break the nudge job. */
    public void sendToUser(UUID userId, String title, String body, String url) {
        if (client == null) return;
        List<PushSubscription> subs = repository.findByUserId(userId);
        if (subs.isEmpty()) return;

        byte[] payload;
        try {
            payload = objectMapper.writeValueAsBytes(Map.of("title", title, "body", body, "url", url));
        } catch (Exception e) {
            log.warn("Could not build push payload", e);
            return;
        }

        for (PushSubscription s : subs) {
            try {
                var n = new nl.martijndwars.webpush.Notification(s.getEndpoint(), s.getP256dh(), s.getAuthKey(), payload);
                var res = client.send(n);
                int code = res.getStatusLine().getStatusCode();
                if (code == 404 || code == 410) {
                    // the browser says this device is gone (uninstalled / permission removed)
                    repository.delete(s);
                } else if (code >= 400) {
                    log.warn("Push to user {} rejected with status {}", userId, code);
                }
            } catch (Exception e) {
                log.warn("Push to user {} failed", userId, e);
            }
        }
    }
}