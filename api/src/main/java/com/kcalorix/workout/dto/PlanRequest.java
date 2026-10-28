package com.kcalorix.workout.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PlanRequest (@NotBlank @Size(max = 100) String name,
                          @Size(max = 500) String description,
                          @NotEmpty @Size(max = 14) @Valid List<PlanDayRequest> days){}
