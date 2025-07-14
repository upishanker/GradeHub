package com.upishanker.gradehub.exceptions;

public class AssignmentNotFoundException extends RuntimeException {
    public AssignmentNotFoundException() {}
    public AssignmentNotFoundException(String message) {
        super(message);
    }
}
