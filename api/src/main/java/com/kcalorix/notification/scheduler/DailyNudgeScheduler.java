package com.kcalorix.notification.scheduler;

import com.kcalorix.insights.dto.DailyBalanceResponse;
import com.kcalorix.insights.service.BalanceService;
import com.kcalorix.notification.dto.NudgeCandidate;
import com.kcalorix.notification.entity.enums.NotificationType;
import com.kcalorix.notification.repository.NotificationPreferenceRepository;
import com.kcalorix.notification.repository.NotificationRepository;
import com.kcalorix.notification.service.NotificationService;
import com.kcalorix.notification.service.PushService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class DailyNudgeScheduler {

    private static final Logger log = LoggerFactory.getLogger(DailyNudgeScheduler.class);

    private final NotificationPreferenceRepository preferenceRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final BalanceService balanceService;
    private final PushService pushService;

    @Scheduled(fixedDelayString = "${calorix.notifications.scan-delay-ms:60000}")
    void sendDailyNudges() {
        for (NudgeCandidate c : preferenceRepository.findNudgeCandidates()) {
            try {
                ZonedDateTime local = Instant.now().atZone(ZoneId.of(c.timezone()));
                LocalDate forDate = local.toLocalDate();
                LocalDateTime scheduled = forDate.atTime(c.nudgeTime());

                // due from the nudge time until 3 hours later; a nudge missed past midnight is skipped
                LocalDateTime now = local.toLocalDateTime();
                boolean due = !now.isBefore(scheduled) && now.isBefore(scheduled.plusHours(3));
                if (!due) continue;

                // avoids recalculating the balance every minute after it was sent
                if (notificationRepository.existsByUserIdAndTypeAndForDate(
                        c.userId(), NotificationType.DAILY_BALANCE, forDate)) {
                    continue;
                }

                DailyBalanceResponse b = balanceService.daily(c.userId(), forDate);

                String title;
                String message;
                if (b.eatenKcal() == 0) {
                    title = "Log your meals";
                    message = "You haven't logged any food today. Log your meals to see your calorie balance.";
                } else {
                    title = switch (b.recommendation().type()) {
                        case EAT_MORE -> "Fuel up";
                        case BURN_OFF -> "Time to burn it off";
                        case ON_TARGET -> "You're on track";
                    };
                    message = b.recommendation().message();
                }

                boolean created = notificationService.createIfAbsent(
                        c.userId(), NotificationType.DAILY_BALANCE, title, message, forDate);

                // also show it on the user's phone/browser, even when the app is closed
                if (created) {
                    pushService.sendToUser(c.userId(), title, message, "/today");
                }
            } catch (Exception e) {
                log.warn("Nudge failed for user {}", c.userId(), e); // one bad user never stops the others
            }
        }
    }

    @Scheduled(cron = "0 30 3 * * *")
    void purgeOld() {
        int deleted = notificationService.purgeOlderThan(Instant.now().minus(90, ChronoUnit.DAYS));
        log.info("Purged {} old notifications", deleted);
    }
}