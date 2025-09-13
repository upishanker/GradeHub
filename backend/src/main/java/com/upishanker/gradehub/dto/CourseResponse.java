package com.upishanker.gradehub.dto;

import java.math.BigDecimal;

public record CourseResponse(Long userId, Long id, String name, Double goal, String semester, Double creditHours, BigDecimal grade, String letterGrade) {}
