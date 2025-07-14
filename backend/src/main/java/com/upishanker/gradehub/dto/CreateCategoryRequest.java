package com.upishanker.gradehub.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateCategoryRequest (
    Long courseId,
    @NotBlank @Size(max = 100) String name,
    @NotNull @Min(0) @Max(100) BigDecimal weight
) {}
