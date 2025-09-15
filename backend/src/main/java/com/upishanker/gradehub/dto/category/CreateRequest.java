package com.upishanker.gradehub.dto.category;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateRequest(
    Long courseId,
    @NotBlank @Size(max = 100) String name,
    @NotNull @Min(0) @Max(100) BigDecimal weight
) {}
