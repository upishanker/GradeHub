package com.upishanker.gradehub.dto.pastcourse;

public record Response(Long userId, Long id, String name, String semester, Double creditHours, String letterGrade) {
}
