package com.upishanker.gradehub.dto.auth;

public record Verify2FARequest (String loginSessionId, String code){}
