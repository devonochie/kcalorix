package com.kcalorix.insights.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyIntake(LocalDate date, BigDecimal kcal, BigDecimal proteinG,
                          BigDecimal carbsG, BigDecimal fatG) {}