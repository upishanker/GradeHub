package com.upishanker.gradehub.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import com.upishanker.gradehub.config.JwtService;
import com.upishanker.gradehub.exceptions.UserNotFoundException;
import com.upishanker.gradehub.exceptions.EmailTakenException;
import com.upishanker.gradehub.model.Code;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.CodeRepository;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.resend.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class CodeService {
    private final CodeRepository repo;
    private final SecureRandom random = new SecureRandom();
    private final JwtService jwtService;
    @Value("${resend.api.key}")
    private String RESEND_API_KEY;
    private final UserRepository userRepository;

    public CodeService(CodeRepository repo, JwtService jwtService, UserRepository userRepository) {
        this.repo = repo;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }
    @Transactional
    public String generateAndStoreCode(User user, String email) {
        String code = String.valueOf(100000 + random.nextInt(90000));

        repo.deleteByUserId(user.getId());

        Code tfa = new Code();
        tfa.setUser(user);
        tfa.setCode(code);
        tfa.setExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES));

        repo.save(tfa);
        return tfa.getCode();
    }
    @Transactional
    public String verifyCode(String loginSessionId, String code, Map<String, Long> tempLoginSessionStore) {
        // Get userId from session (passed as parameter)
        Long userId = tempLoginSessionStore.get(loginSessionId);
        if (userId == null) {
            throw new RuntimeException("Invalid login session");
        }

        boolean isValid = repo.findByUserIdAndCode(userId, code)
                .filter(c -> Instant.now().isBefore(c.getExpiresAt()))
                .isPresent();

        if (!isValid) {
            throw new RuntimeException("Invalid or expired 2FA code");
        }

        // Cleanup
        repo.deleteByUserId(userId);
        tempLoginSessionStore.remove(loginSessionId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Generate JWT
        String email = user.getEmail();
        return jwtService.generateToken(userId, email);
    }
    public void send2FACode(String email, String code) throws ResendException {
        Resend resend = new Resend(RESEND_API_KEY);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("GradeHub <noreply@mail.upishanker.com>")
                .to(email)
                .subject("Your 2FA code for GradeHub")
                .html("Your code is: <strong>" + code + "</strong>")
                .build();

        try {
            CreateEmailResponse data = resend.emails().send(params);
            System.out.println(data.getId());
        } catch (ResendException e) {
            throw new RuntimeException(e);
        }
    }
}