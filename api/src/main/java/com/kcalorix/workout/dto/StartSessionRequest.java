package com.kcalorix.workout.dto;

import java.util.UUID;

public record StartSessionRequest (UUID planId, UUID dayId) {
}
