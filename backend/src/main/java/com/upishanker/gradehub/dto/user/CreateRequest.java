package com.upishanker.gradehub.dto.user;
import jakarta.validation.constraints.*;
public record CreateRequest(
        @NotBlank @Size(min = 3, max = 20) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password

) {}
