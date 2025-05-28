package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.CreateUserRequest;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.service.UserService;
import com.upishanker.gradehub.dto.UserResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping
    public UserResponse createUser(@RequestBody CreateUserRequest createRequest) {
        return userService.createUser(createRequest);
    }
    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable long userId) {
        return userService.getUserById(userId);
    }
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }
    @PatchMapping("/{userId}/username")
    public UserResponse changeUsername(@PathVariable long userId, @RequestBody String newUsername) {
        return userService.changeUsername(userId, newUsername);
    }
    @DeleteMapping("/{userId}")
    public void  deleteUser(@PathVariable long userId) {
        userService.deleteUser(userId);
    }
}
