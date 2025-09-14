package com.upishanker.gradehub.dto;

import jakarta.validation.constraints.*;

public record CreatePastCourseRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 50) String semester,
    @NotNull @Min(1) @Max(6) Double creditHours,
    @NotBlank @Pattern(regexp = "A\\+|A|A-|B\\+|B|B-|C\\+|C|C-|D\\+|D|D-|F",
            message = "Invalid letter grade")
    String letterGrade
) {}
