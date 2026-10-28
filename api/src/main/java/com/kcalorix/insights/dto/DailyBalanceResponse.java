package com.kcalorix.insights.dto;

import java.time.LocalDate;

public record DailyBalanceResponse(LocalDate date, int calorieTarget, int eatenKcal, int burnedKcal,
                                   int creditedBurnKcal, int netKcal, int remainingKcal,
                                   int workoutsCompleted, MacroProgress protein, MacroProgress carbs,
                                   MacroProgress fat, Recommendation recommendation) {}