package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.ChangePasswordRequest;
import com.upishanker.gradehub.dto.CreateUserRequest;
import com.upishanker.gradehub.dto.UpdateUserRequest;
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
    @PatchMapping("/{userId}")
    public UserResponse updateUser(@PathVariable long userId, @RequestBody UpdateUserRequest updateRequest) {
        return userService.updateUser(userId, updateRequest);
    }
    @PatchMapping("/{userId}/password")
    public UserResponse changePassword(@PathVariable long userId, @RequestBody ChangePasswordRequest changePasswordRequest) {
        return userService.changePassword(userId, changePasswordRequest);
    }
    @DeleteMapping("/{userId}")
    public void  deleteUser(@PathVariable long userId) {
        userService.deleteUser(userId);
    }
}
