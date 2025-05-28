package com.upishanker.gradehub.dto;
import jakarta.validation.constraints.*;

public class CreateUserRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
    @NotBlank
    @Email
    private String email;

    public CreateUserRequest() {}
    public CreateUserRequest(String username, String email) {
        this.username = username;
        this.email = email;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
}
