package com.kcalorix.notification.service;

import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.notification.dto.NotificationResponse;
import com.kcalorix.notification.dto.UnreadCountResponse;
import com.kcalorix.notification.entity.Notification;
import com.kcalorix.notification.entity.enums.NotificationType;
import com.kcalorix.notification.repository.NotificationRepository;
import com.kcalorix.user.repository.UserRepository; // adjust package
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(UUID userId, boolean unreadOnly, int page, int size) {
        page = Math.max(0, page);
        size = Math.min(Math.max(1, size), 50);
        PageRequest pageable = PageRequest.of(page, size);

        Page<Notification> result = unreadOnly
                ? repository.findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId, pageable)
                : repository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return PageResponse.from(result.map(NotificationResponse::from));
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(UUID userId) {
        return new UnreadCountResponse(repository.countByUserIdAndReadAtIsNull(userId));
    }

    @Transactional
    public void markRead(UUID userId, UUID id) {
        Notification n = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (n.getReadAt() == null) {
            n.setReadAt(Instant.now());
        }
    }

    @Transactional
    public void markAllRead(UUID userId) {
        repository.markAllRead(userId, Instant.now());
    }

    // No @Transactional: a database error must come out of the repository call so it can be caught.
    public boolean createIfAbsent(UUID userId, NotificationType type, String title,
                                  String message, LocalDate forDate) {
        if (repository.existsByUserIdAndTypeAndForDate(userId, type, forDate)) {
            return false;
        }

        Notification n = new Notification();
        n.setUser(userRepository.getReferenceById(userId));
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setForDate(forDate);

        try {
            repository.saveAndFlush(n);
            return true;
        } catch (DataIntegrityViolationException e) {
            // another server instance created it first; the unique constraint stopped this one
            return false;
        }
    }

    @Transactional
    public int purgeOlderThan(Instant cutoff) {
        return repository.deleteOlderThan(cutoff);
    }
}