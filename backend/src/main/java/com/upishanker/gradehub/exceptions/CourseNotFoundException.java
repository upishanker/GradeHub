package com.upishanker.gradehub.exceptions;

public class CourseNotFoundException extends RuntimeException {
    public CourseNotFoundException() {}
    public CourseNotFoundException(String message) {
        super(message);
    }
}