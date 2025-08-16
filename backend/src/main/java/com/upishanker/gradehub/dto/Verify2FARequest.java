package com.upishanker.gradehub.dto;

public record Verify2FARequest (String loginSessionId, String code){}
