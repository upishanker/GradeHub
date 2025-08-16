package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.config.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public abstract class BaseController {
    @Autowired
    protected JwtService jwtService;

    protected Long getCurrentUserId(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        return jwtService.extractUserId(token);
    }
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("Bearer Token is required");
    }
}
