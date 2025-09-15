package com.upishanker.gradehub.dto.user;

public record Response(Long id, String username, String email, String provider, boolean passwordSet) {}
