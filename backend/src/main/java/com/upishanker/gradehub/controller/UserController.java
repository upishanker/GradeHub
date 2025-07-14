package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.*;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping("/signup")
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest createRequest) {
        return userService.createUser(createRequest);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String jwtToken = userService.login(request.email(), request.password());
        return ResponseEntity.ok(new LoginResponse(jwtToken));
    }

    @GetMapping()
    public UserResponse getUser() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.getUserById(userId);
    }
    @GetMapping("/gpa")
    public BigDecimal getGPA() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.calculateGPA(userId);
    }
    @PatchMapping()
    public UserResponse updateUser(@RequestBody UpdateUserRequest updateRequest) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.updateUser(userId, updateRequest);
    }
    @PatchMapping("/password")
    public UserResponse changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.changePassword(userId, changePasswordRequest);
    }

    @DeleteMapping()
    public void deleteUser() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userService.deleteUser(userId);
    }
}