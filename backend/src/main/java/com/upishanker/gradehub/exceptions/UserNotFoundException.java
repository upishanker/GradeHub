package com.upishanker.gradehub.exceptions;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException() {}
    public UserNotFoundException(String message) {
        super(message);
    }
}

