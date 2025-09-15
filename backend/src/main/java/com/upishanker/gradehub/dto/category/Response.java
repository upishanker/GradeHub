package com.upishanker.gradehub.dto.category;

import java.math.BigDecimal;

public record Response(
    Long id,
    Long courseId,
    String name,
    BigDecimal weight
) {}
