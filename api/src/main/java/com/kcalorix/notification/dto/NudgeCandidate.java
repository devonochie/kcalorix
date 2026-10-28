package com.kcalorix.notification.dto;

import java.time.LocalTime;
import java.util.UUID;

public record NudgeCandidate(UUID userId, LocalTime nudgeTime, String timezone) {}