package com.upishanker.gradehub.dto.assignment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.*;
import jakarta.annotation.Nullable;

public record CreateRequest(
        Long courseId,
        @NotBlank @Size(max = 100) String name,
        @Nullable Long categoryId,
        @Nullable @Min(0) @Max(120) BigDecimal grade,
        @NotNull @Min(0) @Max(100) BigDecimal weight,
        @Nullable LocalDateTime dueDate
) {}

