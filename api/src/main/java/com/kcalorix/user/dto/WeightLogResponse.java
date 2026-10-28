package com.kcalorix.user.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeightLogResponse(LocalDate date, BigDecimal weightKg) {
}
