package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Autowired
public class UserController {
    private UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    public User getUser(@PathVariable long userId) {
        return userService.getUserById(userId);
    }
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    public User updateUser(@PathVariable long userId, @RequestBody User updatedUser) {
        return userService.updateUser(userId, updatedUser);
    }
    public void  deleteUser(@PathVariable long userId) {
        userService.deleteUser(userId);
    }
    public List<Course> getUserCourses(@PathVariable long userId) {
        return userService.getUserCourses(userId);
    }
}
