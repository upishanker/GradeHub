package com.upishanker.gradehub.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.upishanker.gradehub.config.GoogleTokenVerifier;
import com.upishanker.gradehub.config.JwtService;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthController(JwtService jwtService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          GoogleTokenVerifier googleTokenVerifier) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing idToken"));
        }

        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);
        if (payload == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Google token"));
        }

        String email = payload.getEmail();
        Object emailVerifiedObj = payload.get("email_verified");
        boolean emailVerified = Boolean.TRUE.equals(emailVerifiedObj);
        if (!emailVerified) {
            return ResponseEntity.status(401).body(Map.of("error", "Email not verified"));
        }

        // Upsert user by email
        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setEmail(email);

            // Derive a unique username
            String base = (email != null && email.contains("@")) ? email.substring(0, email.indexOf("@")) : "user";
            String candidate = base;
            int i = 1;
            while (userRepository.existsByUsername(candidate)) {
                candidate = base + i++;
            }
            user.setUsername(candidate);
            user.setPassword(null);
            user.setProvider("GOOGLE");
            user.setPasswordSet(false);

            userRepository.save(user);
        } else {
            if (user.getProvider() == null) {
                user.setProvider("GOOGLE");
            }
            if (user.getPassword() != null && !user.getPassword().isBlank()) {
                user.setPasswordSet(true);
            }
            userRepository.save(user);
        }

        String jwt = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of("token", jwt));
    }
}