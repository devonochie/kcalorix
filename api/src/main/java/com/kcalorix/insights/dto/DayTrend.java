package com.kcalorix.insights.dto;

import java.time.LocalDate;

public record DayTrend(LocalDate date, int eatenKcal, int burnedKcal, int workoutsCompleted) {}