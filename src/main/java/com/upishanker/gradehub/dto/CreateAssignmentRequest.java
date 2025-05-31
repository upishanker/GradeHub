package com.upishanker.gradehub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.validation.constraints.*;
import org.springframework.cglib.core.Local;

public record CreateAssignmentRequest(
        Long courseId,
        @NotBlank @Size(max = 100) String name,
        @Min(0) @Max(120) BigDecimal grade,
        @NotNull @Min(0) @Max(100) BigDecimal weight,
        LocalDateTime dueDate
) {}

