package com.upishanker.gradehub.dto.assignment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Response(Long courseId, Long categoryId, Long id, String name, BigDecimal grade, BigDecimal weight, LocalDateTime dueDate) {}
