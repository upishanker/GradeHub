package com.upishanker.gradehub.service;

import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.dto.UserResponse;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    public UserResponse createUser(User user) {
        user =  userRepository.save(user);
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
    public UserResponse changeUsername(Long userId, String newUsername) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean b = !userRepository.existsByUsername(newUsername);
        if(b) {
            currentUser.setUsername(newUsername);
        }
        else {
            throw new RuntimeException("Username taken");
        }
        userRepository.save(currentUser);
        return new UserResponse(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail()
        );
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail()
                ))
                .toList();
    }
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}