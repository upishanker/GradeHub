package com.upishanker.gradehub.dto;
import jakarta.validation.constraints.*;
public record CreateUserRequest(
        @NotBlank @Size(min = 3, max = 20) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password

) {}
