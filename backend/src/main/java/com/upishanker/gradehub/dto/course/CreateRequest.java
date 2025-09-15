package com.upishanker.gradehub.dto.course;


import jakarta.validation.constraints.*;
public record CreateRequest(
        @NotBlank @Size(max = 100) String name,
        @Min(0) @Max(100) Double goal,
        @NotBlank @Size(max = 50) String semester,
        @NotNull @Min(1) @Max(6) Double creditHours
) {}
