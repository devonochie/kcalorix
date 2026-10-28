package com.kcalorix.insights.service;


import com.kcalorix.insights.dto.TargetsResponse;
import com.kcalorix.user.entity.enums.ActivityLevel;
import com.kcalorix.user.entity.enums.Goal;
import com.kcalorix.user.entity.enums.Sex;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class TargetCalculator {

    public TargetsResponse calculate(Sex sex, int age, BigDecimal weightKg, BigDecimal heightCm,
                                     ActivityLevel activity, Goal goal, BigDecimal weeklyRateKg) {

        double kg = weightKg.doubleValue();
        double cm = heightCm.doubleValue();
        List<String> notes = new ArrayList<>();

        double bmr = 10 * kg + 6.25 * cm - 5 * age + (sex == Sex.MALE ? 5 : -161);

        double tdee = bmr * activity.getFactor();

        double delta = (goal == Goal.MAINTAIN || weeklyRateKg == null)
                ? 0
                : weeklyRateKg.doubleValue() * 7700 / 7;

        double target = tdee;
        if (goal == Goal.LOSE) {
            target = tdee - delta;
            double floor = Math.max(sex == Sex.MALE ? 1500 : 1200, 0.75 * tdee);
            if (target < floor) {
                target = floor;
                notes.add("Pace too aggressive: target raised to a safe minimum");
            }
        } else if (goal == Goal.GAIN) {
            target = tdee + delta;
            double cap = 1.20 * tdee;
            if (target > cap) {
                target = cap;
                notes.add("Surplus capped at 20% above maintenance");
            }
        }

        double proteinPerKg = switch (goal) {
            case LOSE -> 2.0;
            case MAINTAIN -> 1.6;
            case GAIN -> 1.8;
        };
        double proteinG = kg * proteinPerKg;
        double fatKcal = 0.25 * target;
        double fatG = fatKcal / 9;
        double carbsG = (target - proteinG * 4 - fatKcal) / 4;
        if (carbsG < 0) {
            carbsG = 0;
            notes.add("Protein alone covers your calorie target");
        }

        return new TargetsResponse(
                (int) Math.round(bmr),
                (int) Math.round(tdee),
                (int) Math.round(target),
                (int) Math.round(proteinG),
                (int) Math.round(carbsG),
                (int) Math.round(fatG),
                weeklyRateKg,
                notes
        );
    }
}
