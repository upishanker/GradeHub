package com.upishanker.gradehub.exceptions;

public class CategoryNotFoundException extends RuntimeException {
  public CategoryNotFoundException() {}
  public CategoryNotFoundException(String message) {
        super(message);
    }
}
