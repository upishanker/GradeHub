package com.upishanker.gradehub.dto;

import java.math.BigDecimal;

public record CategoryResponse (
    Long id,
    Long courseId,
    String name,
    BigDecimal weight
) {}
