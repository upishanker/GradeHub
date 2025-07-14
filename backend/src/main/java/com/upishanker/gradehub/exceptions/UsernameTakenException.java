package com.upishanker.gradehub.exceptions;

public class UsernameTakenException extends RuntimeException {
    public UsernameTakenException() {}
    public UsernameTakenException(String message) {
        super(message);
    }
}
