package com.upishanker.gradehub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

public class CreateAssignmentRequest {
    private Long courseId;
    @NotBlank
    @Size(max = 100)
    private String name;
    @Min(0)
    @Max(120)
    private BigDecimal grade;
    @NotNull
    @Min(0)
    @Max(100)
    private BigDecimal weight;
    private LocalDateTime dueDate;

    public CreateAssignmentRequest() {}
    public CreateAssignmentRequest(Long courseId, String name, BigDecimal grade, BigDecimal weight, LocalDateTime dueDate) {
        this.courseId = courseId;
        this.name = name;
        this.grade = grade;
        this.weight = weight;
        this.dueDate = dueDate;
    }
    public Long getCourseId() {
        return courseId;
    }
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public BigDecimal getGrade() {
        return grade;
    }
    public void setGrade(BigDecimal grade) {
        this.grade = grade;
    }
    public BigDecimal getWeight() {
        return weight;
    }
    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

}

