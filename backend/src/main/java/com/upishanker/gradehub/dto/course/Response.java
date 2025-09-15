package com.upishanker.gradehub.dto.course;

import java.math.BigDecimal;

public record Response(Long userId, Long id, String name, Double goal, String semester, Double creditHours, BigDecimal grade, String letterGrade) {}
