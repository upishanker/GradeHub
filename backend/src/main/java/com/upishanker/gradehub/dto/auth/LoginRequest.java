package com.upishanker.gradehub.dto.auth;

public record LoginRequest(
        String email,
        String password
) {}