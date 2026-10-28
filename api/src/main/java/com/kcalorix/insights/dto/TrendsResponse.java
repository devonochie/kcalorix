package com.kcalorix.insights.dto;

import com.kcalorix.user.dto.WeightLogResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TrendsResponse(LocalDate from, LocalDate to, int calorieTarget, List<DayTrend> days,
                             int daysLogged, int avgEatenKcal, int avgBurnedKcal,
                             List<WeightLogResponse> weights, BigDecimal weightChangeKg) {}