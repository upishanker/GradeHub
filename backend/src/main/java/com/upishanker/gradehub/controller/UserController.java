package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.auth.ChangePasswordRequest;
import com.upishanker.gradehub.dto.auth.LoginRequest;
import com.upishanker.gradehub.dto.auth.Verify2FARequest;
import com.upishanker.gradehub.dto.user.CreateRequest;
import com.upishanker.gradehub.dto.user.UpdateRequest;
import com.upishanker.gradehub.dto.user.Response;
import com.upishanker.gradehub.service.UserService;
import com.upishanker.gradehub.service.CodeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private final UserService userService;
    @Autowired
    private final CodeService codeService;

    public UserController(UserService userService, CodeService codeService) {
        this.userService = userService;
        this.codeService = codeService;
    }
    @PostMapping("/signup")
    public Response createUser(@Valid @RequestBody CreateRequest createRequest) {
        return userService.createUser(createRequest);
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        String loginSessionId = userService.login(request.email(), request.password());
        return ResponseEntity.ok(Map.of("loginSessionId", loginSessionId));
    }
    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestBody Verify2FARequest req) {
        try {
            String jwt = userService.verifyCodeAndGenerateToken(req.loginSessionId(), req.code());
            return ResponseEntity.ok(Map.of("token", jwt));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping()
    public Response getUser() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.getUserById(userId);
    }
    @GetMapping("/gpa")
    public BigDecimal getGPA() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.calculateGPA(userId);
    }
    @PatchMapping()
    public Response updateUser(@RequestBody UpdateRequest updateRequest) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.updateUser(userId, updateRequest);
    }
    @PatchMapping("/password")
    public Response changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.changePassword(userId, changePasswordRequest);
    }
    @PatchMapping("/password/set")
    public Response setPassword(@RequestBody Map<String, String> req) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String newPassword = req.get("newPassword");
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        return userService.setPasswordIfUnset(userId, newPassword);
    }

    @DeleteMapping()
    public void deleteUser() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userService.deleteUser(userId);
    }
}