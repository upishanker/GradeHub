package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    @GetMapping("/{userId}")
    public User getUser(@PathVariable long userId) {
        return userService.getUserById(userId);
    }
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    @PatchMapping("/{userId}/username")
    public User changeUsername(@PathVariable long userId, @RequestBody String newUsername) {
        return userService.changeUsername(userId, newUsername);
    }
    @DeleteMapping("/{userId}")
    public void  deleteUser(@PathVariable long userId) {
        userService.deleteUser(userId);
    }
}
