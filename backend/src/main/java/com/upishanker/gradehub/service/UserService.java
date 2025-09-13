package com.upishanker.gradehub.service;

import com.upishanker.gradehub.config.JwtService;
import com.upishanker.gradehub.dto.*;
import com.upishanker.gradehub.exceptions.EmailTakenException;
import com.upishanker.gradehub.exceptions.UserNotFoundException;
import com.upishanker.gradehub.exceptions.UsernameTakenException;
import com.upishanker.gradehub.exceptions.IncorrectPasswordException;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.model.GradeScale;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.GradeScaleRepository;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CourseService courseService;
    private final PasswordEncoder passwordEncoder;
    private final CodeService codeService;
    @Autowired
    private GradeScaleRepository gradeScaleRepository;
    final Map<String, Long> tempLoginSessionStore = new ConcurrentHashMap<>();

    public UserService(JwtService jwtService,
                       UserRepository userRepository,
                       CourseService courseService,
                       PasswordEncoder passwordEncoder,
                       CodeService twoFactorService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.courseService = courseService;
        this.passwordEncoder = passwordEncoder;
        this.codeService = twoFactorService;
    }

    public UserResponse createUser(CreateUserRequest createRequest) {
        User user = new User();
        if(userRepository.existsByUsername(createRequest.username())) {
            throw new UsernameTakenException("Username '" + createRequest.username() + "' is already taken");
        }
        if(userRepository.existsByEmail(createRequest.email())) {
            throw new EmailTakenException("Email '" + createRequest.email() + "' is already taken");
        }
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

        List<GradeScale> scales = gradeScaleRepository.findAllByOrderByMinPercentDesc();

        BigDecimal gradePoints = BigDecimal.ZERO;
        BigDecimal totalHours = BigDecimal.ZERO;

        for (Course course : user.getCourses()) {
            if (course.getCreditHours() != 0.0) {
                BigDecimal grade = courseService.calculateGrade(course.getId());
                BigDecimal creditHours = BigDecimal.valueOf(course.getCreditHours());

                for (GradeScale scale : scales) {
                    if (grade.compareTo(BigDecimal.valueOf(scale.getMinPercent())) >= 0) {
                        gradePoints = gradePoints.add(creditHours.multiply(BigDecimal.valueOf(scale.getGpaValue())));
                        break;
                    }
                }
                totalHours = totalHours.add(creditHours);
            }
        }

        return totalHours.compareTo(BigDecimal.ZERO) > 0
                ? gradePoints.divide(totalHours, 2, RoundingMode.HALF_EVEN)
                : BigDecimal.ZERO;
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
            String code = codeService.generateAndStoreCode(user, email);
            try {
                codeService.send2FACode(email, code);
            } catch (Exception e) {
                // Log the error but don't fail the login process
                System.err.println("Failed to send 2FA code: " + e.getMessage());
                // You might want to use a proper logger here
                throw new RuntimeException("Failed to send 2FA code. Please try again.");
            }
            String loginSessionId = UUID.randomUUID().toString();
            tempLoginSessionStore.put(loginSessionId, user.getId());
            return loginSessionId;
        }
    }
    public String verifyCodeAndGenerateToken(String loginSessionId, String code) {
        return codeService.verifyCode(loginSessionId, code, tempLoginSessionStore);
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

    public Long getUserIdFromSession(String loginSessionId) {
        return tempLoginSessionStore.get(loginSessionId);
    }

    public void removeSession(String loginSessionId) {
        tempLoginSessionStore.remove(loginSessionId);
    }
}