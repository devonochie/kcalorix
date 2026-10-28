package com.kcalorix.workout.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PlanDayRequest (@NotBlank @Size(max = 60) String name,
                              @NotEmpty @Size(max = 30) @Valid List<PlanExerciseRequest> exercises){
}