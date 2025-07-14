package com.upishanker.gradehub.service;

import com.upishanker.gradehub.config.JwtService;
import com.upishanker.gradehub.dto.*;
import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import com.upishanker.gradehub.exceptions.UserNotFoundException;
import com.upishanker.gradehub.exceptions.UsernameTakenException;
import com.upishanker.gradehub.exceptions.IncorrectPasswordException;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class UserService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CourseService courseService;
    private final PasswordEncoder passwordEncoder;

    public UserService(JwtService jwtService,
                       UserRepository userRepository,
                       CourseService courseService,
                       PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.courseService = courseService;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(CreateUserRequest createRequest) {
        User user = new User();
        user.setUsername(createRequest.username());
        user.setEmail(createRequest.email());
        user.setPassword(passwordEncoder.encode(createRequest.password()));
        userRepository.save(user);
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
    public UserResponse changeUsername(Long userId, String newUsername) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        boolean b = !userRepository.existsByUsername(newUsername);
        if(b) {
            currentUser.setUsername(newUsername);
        }
        else {
            throw new UsernameTakenException("Username '" + newUsername + "' taken");
        }
        userRepository.save(currentUser);
        return new UserResponse(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail()
        );
    }
    public UserResponse updateUser(Long userId, UpdateUserRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        if(!user.getUsername().equals(updateRequest.getUsername()) &&
                userRepository.existsByUsername(updateRequest.getUsername())) {
            throw new UsernameTakenException("Username '" + updateRequest.getUsername() + "' taken");
        }
        if (updateRequest.getUsername() != null) {
            user.setUsername(updateRequest.getUsername());
        }
        if (updateRequest.getEmail() != null) {
            user.setEmail(updateRequest.getEmail());
        }
        userRepository.save(user);
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
    public BigDecimal calculateGPA(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        BigDecimal gradePoints = BigDecimal.ZERO;
        BigDecimal totalHours = BigDecimal.ZERO;

        for  (Course course : user.getCourses()) {
            if (course.getCreditHours() != 0.0) {
                BigDecimal grade = courseService.calculateGrade(course.getId());
                BigDecimal creditHours = BigDecimal.valueOf(course.getCreditHours());
                BigDecimal score = BigDecimal.ZERO;
                totalHours = totalHours.add(creditHours);
                if(grade.compareTo(BigDecimal.valueOf(92)) >= 0) {
                    score = BigDecimal.valueOf(4.0);
                }
                else if(grade.compareTo(BigDecimal.valueOf(90)) >= 0) {
                    score = BigDecimal.valueOf(3.7);
                }
                else if(grade.compareTo(BigDecimal.valueOf(87)) >= 0) {
                    score = BigDecimal.valueOf(3.3);
                }
                else if(grade.compareTo(BigDecimal.valueOf(82)) >= 0) {
                    score = BigDecimal.valueOf(3.0);
                }
                else if(grade.compareTo(BigDecimal.valueOf(80)) >= 0) {
                    score = BigDecimal.valueOf(2.7);
                }
                else if(grade.compareTo(BigDecimal.valueOf(77)) >= 0) {
                    score = BigDecimal.valueOf(2.3);
                }
                else if(grade.compareTo(BigDecimal.valueOf(72)) >= 0) {
                    score = BigDecimal.valueOf(2.0);
                }
                else if(grade.compareTo(BigDecimal.valueOf(70)) >= 0) {
                    score = BigDecimal.valueOf(1.7);
                }
                else if(grade.compareTo(BigDecimal.valueOf(67)) >= 0) {
                    score = BigDecimal.valueOf(1.3);
                }
                else if(grade.compareTo(BigDecimal.valueOf(62)) >= 0) {
                    score = BigDecimal.valueOf(1.0);
                }
                else if(grade.compareTo(BigDecimal.valueOf(60)) >= 0) {
                    score = BigDecimal.valueOf(0.7);
                }
                gradePoints = gradePoints.add(creditHours.multiply(score));
            }
        }
        if(totalHours.compareTo(BigDecimal.ZERO) > 0) {
            return gradePoints.divide(totalHours, RoundingMode.HALF_EVEN);
        }
        return BigDecimal.ZERO;
    }
    public UserResponse changePassword(Long userId, ChangePasswordRequest changeRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        if (!passwordEncoder.matches(changeRequest.currentPassword(), user.getPassword())) {
            throw new IncorrectPasswordException("Current password is incorrect");
        }
        if (passwordEncoder.matches(changeRequest.newPassword(), user.getPassword())) {
            throw new IncorrectPasswordException("New password cannot be the same as the current password");
        }
        user.setPassword(passwordEncoder.encode(changeRequest.newPassword()));
        userRepository.save(user);
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new IncorrectPasswordException("Invalid password");
        }
        else {
            return jwtService.generateToken(user.getId(), user.getUsername());
        }

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
