package com.upishanker.gradehub.dto;

public record PastCourseResponse (Long userId, Long id, String name, String semester, Double creditHours, String letterGrade) {
}
