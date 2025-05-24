package com.upishanker.gradehub.service;

import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    public User createUser(User user) {
        return userRepository.save(user);
    }
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    public User changeUsername(Long userId, String newUsername) {
        User currentUser = getUserById(userId);
        boolean b = !userRepository.existsByUsername(newUsername);
        if(b) {
            currentUser.setUsername(newUsername);
        }
        else {
            throw new RuntimeException("Username taken");
        }
        return userRepository.save(currentUser);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}