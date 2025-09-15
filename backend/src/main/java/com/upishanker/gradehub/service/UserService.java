package com.upishanker.gradehub.service;

import com.upishanker.gradehub.config.JwtService;
import com.upishanker.gradehub.dto.auth.ChangePasswordRequest;
import com.upishanker.gradehub.dto.user.CreateRequest;
import com.upishanker.gradehub.dto.user.UpdateRequest;
import com.upishanker.gradehub.dto.user.Response;
import com.upishanker.gradehub.exceptions.EmailTakenException;
import com.upishanker.gradehub.exceptions.UserNotFoundException;
import com.upishanker.gradehub.exceptions.UsernameTakenException;
import com.upishanker.gradehub.exceptions.IncorrectPasswordException;
import com.upishanker.gradehub.model.*;
import com.upishanker.gradehub.repository.CourseGradeScaleRepository;
import com.upishanker.gradehub.repository.GradeScaleRepository;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
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
    @Autowired
    private final CourseGradeScaleRepository courseGradeScaleRepository;
    final Map<String, Long> tempLoginSessionStore = new ConcurrentHashMap<>();

    public UserService(JwtService jwtService,
                       UserRepository userRepository,
                       CourseService courseService,
                       PasswordEncoder passwordEncoder,
                       CodeService twoFactorService, CourseGradeScaleRepository courseGradeScaleRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.courseService = courseService;
        this.passwordEncoder = passwordEncoder;
        this.codeService = twoFactorService;
        this.courseGradeScaleRepository = courseGradeScaleRepository;
    }

    public Response createUser(CreateRequest createRequest) {
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
        user.setProvider("LOCAL");
        user.setPasswordSet(true);
        userRepository.save(user);
        return new Response(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProvider(),
                user.isPasswordSet()
        );
    }
    public Response getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return new Response(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProvider(),
                user.isPasswordSet()
        );
    }
    public Response changeUsername(Long userId, String newUsername) {
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
        return new Response(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail(),
                currentUser.getProvider(),
                currentUser.isPasswordSet()
        );
    }
    public Response updateUser(Long userId, UpdateRequest updateRequest) {
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
        return new Response(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProvider(),
                user.isPasswordSet()
        );
    }
    public BigDecimal calculateGPA(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        List<GradeScale> userGpaRows = gradeScaleRepository.findAllByUserIdOrderByLetterAsc(userId);

        BigDecimal gradePoints = BigDecimal.ZERO;
        BigDecimal totalHours = BigDecimal.ZERO;

        for (Course course : user.getCourses()) {
            double ch = course.getCreditHours();
            if (ch == 0.0) continue;

            BigDecimal creditHours = BigDecimal.valueOf(ch);

            // 1) Compute numeric percent for the course (0..100), normalized by effective weights
            BigDecimal percent = courseService.calculateGrade(course.getId());

            // 2) Map percent -> letter using the course's CourseGradeScale
            String letter = mapPercentToLetterForCourse(course.getId(), percent);

            // 3) Map letter -> GPA using the user's GradeScale
            BigDecimal gpaValue = mapLetterToUserGpa(userId, letter, userGpaRows);

            if (gpaValue != null) {
                gradePoints = gradePoints.add(creditHours.multiply(gpaValue));
                totalHours = totalHours.add(creditHours);
            }
        }
        for (PastCourse pastCourse : user.getPastCourses()) {
            double ch =  pastCourse.getCreditHours();
            if (ch == 0.0) continue;

            BigDecimal creditHours = BigDecimal.valueOf(ch);
            BigDecimal gpaValue = mapLetterToUserGpa(userId, pastCourse.getLetterGrade(), userGpaRows);
            if (gpaValue != null) {
                gradePoints = gradePoints.add(creditHours.multiply(gpaValue));
                totalHours = totalHours.add(creditHours);
            }
        }
        if (totalHours.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
        }
        return gradePoints.divide(totalHours, 2, RoundingMode.HALF_EVEN);
    }


    private String mapPercentToLetterForCourse(Long courseId, BigDecimal percent) {
        List<CourseGradeScale> scale = courseGradeScaleRepository.findByCourseId(courseId);
        if (scale == null || scale.isEmpty() || percent == null) return null;

        // Sort by minPercent desc and pick the first where p >= minPercent
        scale.sort(Comparator.comparing(CourseGradeScale::getMinPercent).reversed());
        double p = percent.doubleValue();
        for (CourseGradeScale row : scale) {
            if (p >= row.getMinPercent()) return row.getLetter();
        }
        // If nothing matched, return the lowest letter if present (minPercent 0), else null
        return null;
    }


    private BigDecimal mapLetterToUserGpa(Long userId, String letter, List<GradeScale> userGpaRows) {
        if (letter == null || letter.isBlank() || userGpaRows == null) return null;
        for (GradeScale row : userGpaRows) {
            if (letter.equalsIgnoreCase(row.getLetter())) {
                Double val = row.getGpaValue();
                return val != null ? BigDecimal.valueOf(val) : null;
            }
        }
        return null;
    }
    public Response changePassword(Long userId, ChangePasswordRequest changeRequest) {
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
        return new Response(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProvider(),
                user.isPasswordSet()
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
    public Response setPasswordIfUnset(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        // Only allow if currently unset
        if (user.isPasswordSet()) {
            throw new IncorrectPasswordException("Password already set. Use change password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordSet(true);

        // If the user was GOOGLE, keep provider as GOOGLE.
        // If you want to switch provider to LOCAL after setting a password, you could,
        // but it's fine to keep provider="GOOGLE" and just indicate passwordSet=true.
        userRepository.save(user);

        return new Response(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProvider(),
                user.isPasswordSet()
        );
    }
    public List<Response> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new Response(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getProvider(),
                        user.isPasswordSet()
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