package com.upishanker.gradehub.dto;
import jakarta.validation.constraints.*;
public record LoginRequest(
        String email,
        String password
) {}