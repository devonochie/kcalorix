package com.kcalorix.insights.service;

import com.kcalorix.insights.dto.*;
import com.kcalorix.nutrition.repository.MealEntryRepository;
import com.kcalorix.user.dto.WeightLogResponse;
import com.kcalorix.user.entity.UserProfile;
import com.kcalorix.user.entity.enums.Goal;                 // adjust package
import com.kcalorix.user.repository.UserProfileRepository;
import com.kcalorix.user.service.WeightLogService;          // adjust package
import com.kcalorix.workout.entity.enums.SessionStatus;
import com.kcalorix.workout.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BalanceService {

    private static final int TOLERANCE_KCAL = 100;

    private final TargetService targetService;
    private final MealEntryRepository mealEntryRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserProfileRepository userProfileRepository;
    private final WeightLogService weightLogService;
    private final double exerciseCredit;

    public BalanceService(TargetService targetService,
                          MealEntryRepository mealEntryRepository,
                          WorkoutSessionRepository workoutSessionRepository,
                          UserProfileRepository userProfileRepository,
                          WeightLogService weightLogService,
                          @Value("${calorix.exercise-credit}") double exerciseCredit) {
        this.targetService = targetService;
        this.mealEntryRepository = mealEntryRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.userProfileRepository = userProfileRepository;
        this.weightLogService = weightLogService;
        this.exerciseCredit = exerciseCredit;
    }

    @Transactional(readOnly = true)
    public DailyBalanceResponse daily(UUID userId, LocalDate date) {
        UserProfile profile = userProfileRepository.findById(userId).orElseThrow();
        ZoneId zone = ZoneId.of(profile.getTimezone());
        if (date == null) {
            date = LocalDate.now(zone);
        }

        // returns 400 "Complete your profile first" when onboarding is incomplete
        var targets = targetService.getTargets(userId);

        List<DailyIntake> rows = mealEntryRepository.findDailyIntake(userId, date, date);
        DailyIntake intake = rows.isEmpty()
                ? new DailyIntake(date, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)
                : rows.get(0);

        Instant from = date.atStartOfDay(zone).toInstant();
        Instant to = date.plusDays(1).atStartOfDay(zone).toInstant();
        List<BurnedRow> burnedRows =
                workoutSessionRepository.findBurned(userId, SessionStatus.COMPLETED, from, to);

        int burned = burnedRows.stream()
                .mapToInt(r -> r.caloriesBurned() == null ? 0 : r.caloriesBurned())
                .sum();
        int workoutsCompleted = burnedRows.size();

        int eaten = round(intake.kcal());
        int credited = round(BigDecimal.valueOf(burned).multiply(BigDecimal.valueOf(exerciseCredit)));
        int net = eaten - credited;
        int target = targets.calorieTarget();
        int remaining = target - net;

        return new DailyBalanceResponse(
                date, target, eaten, burned, credited, net, remaining, workoutsCompleted,
                new MacroProgress(round(intake.proteinG()), targets.proteinG()),
                new MacroProgress(round(intake.carbsG()), targets.carbsG()),
                new MacroProgress(round(intake.fatG()), targets.fatG()),
                recommend(remaining, profile.getGoal()));
    }

    @Transactional(readOnly = true)
    public TrendsResponse trends(UUID userId, int days, LocalDate end) {
        UserProfile profile = userProfileRepository.findById(userId).orElseThrow();
        ZoneId zone = ZoneId.of(profile.getTimezone());
        if (end == null) {
            end = LocalDate.now(zone);
        }

        days = Math.min(Math.max(days, 1), 90);
        LocalDate from = end.minusDays(days - 1);

        int calorieTarget = targetService.getTargets(userId).calorieTarget();

        Map<LocalDate, DailyIntake> intakeByDate = mealEntryRepository
                .findDailyIntake(userId, from, end).stream()
                .collect(Collectors.toMap(DailyIntake::date, Function.identity()));

        Instant fromInstant = from.atStartOfDay(zone).toInstant();
        Instant toInstant = end.plusDays(1).atStartOfDay(zone).toInstant();
        List<BurnedRow> burnedRows = workoutSessionRepository
                .findBurned(userId, SessionStatus.COMPLETED, fromInstant, toInstant);

        // raw burned calories (no credit factor) and workout count per local date
        Map<LocalDate, Integer> burnedByDate = new HashMap<>();
        Map<LocalDate, Integer> workoutsByDate = new HashMap<>();
        for (BurnedRow row : burnedRows) {
            LocalDate d = row.startedAt().atZone(zone).toLocalDate();
            int kcal = row.caloriesBurned() == null ? 0 : row.caloriesBurned();
            burnedByDate.merge(d, kcal, Integer::sum);
            workoutsByDate.merge(d, 1, Integer::sum);
        }

        List<DayTrend> dayTrends = new ArrayList<>();
        int totalEatenLogged = 0;
        int totalBurned = 0;
        int daysLogged = 0;
        for (LocalDate d = from; !d.isAfter(end); d = d.plusDays(1)) {
            DailyIntake intake = intakeByDate.get(d);
            int eaten = 0;
            if (intake != null) {
                eaten = round(intake.kcal());
                totalEatenLogged += eaten;
                daysLogged++;
            }
            int burned = burnedByDate.getOrDefault(d, 0);
            totalBurned += burned;
            dayTrends.add(new DayTrend(d, eaten, burned, workoutsByDate.getOrDefault(d, 0)));
        }

        int avgEaten = daysLogged == 0 ? 0 : round(
                BigDecimal.valueOf(totalEatenLogged)
                        .divide(BigDecimal.valueOf(daysLogged), 2, RoundingMode.HALF_UP));
        int avgBurned = round(
                BigDecimal.valueOf(totalBurned)
                        .divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP));

        List<WeightLogResponse> weights = weightLogService.list(userId, from, end);
        BigDecimal weightChange = null;
        if (weights.size() >= 2) {
            weightChange = weights.get(weights.size() - 1).weightKg()
                    .subtract(weights.get(0).weightKg())
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return new TrendsResponse(from, end, calorieTarget, dayTrends, daysLogged,
                avgEaten, avgBurned, weights, weightChange);
    }

    private Recommendation recommend(int remaining, Goal goal) {
        if (remaining > TOLERANCE_KCAL) {
            String message = goal == Goal.GAIN
                    ? "Eat " + remaining + " kcal more to hit your bulking target."
                    : "You can eat " + remaining + " kcal more and stay on target.";
            return new Recommendation(RecommendationType.EAT_MORE, remaining, message);
        }
        if (remaining < -TOLERANCE_KCAL && goal != Goal.GAIN) {
            int kcal = -remaining;
            return new Recommendation(RecommendationType.BURN_OFF, kcal,
                    "You are " + kcal + " kcal over your target. A workout burning about "
                            + kcal + " kcal would bring you back.");
        }
        String message = (goal == Goal.GAIN && remaining < -TOLERANCE_KCAL)
                ? "Target reached, you are " + (-remaining) + " kcal above it."
                : "You are on target for today.";
        return new Recommendation(RecommendationType.ON_TARGET, 0, message);
    }

    private int round(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP).intValue();
    }
}