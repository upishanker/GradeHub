package com.upishanker.gradehub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AssignmentResponse(Long courseId, Long id, String name, BigDecimal grade, BigDecimal weight, LocalDateTime dueDate) {}
