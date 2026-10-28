package com.kcalorix.user.service;

import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.user.entity.User;
import com.kcalorix.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountDeletionService {

    private static final Logger log = LoggerFactory.getLogger(AccountDeletionService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FindByIndexNameSessionRepository<? extends Session> sessions;
    private final EntityManager em;

    @Transactional
    public void deleteAccount(UUID userId, String rawPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            log.warn("Account deletion rejected: wrong password for user {}", userId);
            throw new BadRequestException("Incorrect password");
        }

        String email = user.getEmail();

        // children first, deepest to shallowest
        exec("delete from SessionSet s where s.session.id in (select w.id from WorkoutSession w where w.user.id = :id)", userId);
        exec("delete from WorkoutSession w where w.user.id = :id", userId);
        exec("delete from PlanExercise pe where pe.planDay.id in (select d.id from PlanDay d where d.plan.user.id = :id)", userId);
        exec("delete from PlanDay d where d.plan.id in (select p.id from WorkoutPlan p where p.user.id = :id)", userId);
        exec("delete from WorkoutPlan p where p.user.id = :id", userId);
        exec("delete from MealEntry m where m.user.id = :id", userId);
        exec("delete from WeightLog w where w.user.id = :id", userId);
        exec("delete from PushSubscription ps where ps.user.id = :id", userId);
        exec("delete from Notification n where n.user.id = :id", userId);
        exec("delete from NotificationPreference np where np.user.id = :id", userId);
        exec("delete from AuthToken t where t.user.id = :id", userId);
        exec("delete from UserProfile up where up.user.id = :id", userId);
        exec("delete from User u where u.id = :id", userId);

        // log the user out everywhere (same pattern as your password reset)
        sessions.findByPrincipalName(email).keySet().forEach(sessions::deleteById);

        log.info("Account deleted: {}", userId);
    }

    private void exec(String jpql, UUID id) {
        em.createQuery(jpql).setParameter("id", id).executeUpdate();
    }
}