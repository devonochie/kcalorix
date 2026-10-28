package com.kcalorix.workout.dto;

import jakarta.validation.constraints.Size;

public record FinishSessionRequest(@Size(max = 500) String notes) {
}
