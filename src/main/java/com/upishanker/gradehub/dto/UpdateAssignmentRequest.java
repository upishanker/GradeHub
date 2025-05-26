package com.upishanker.gradehub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UpdateAssignmentRequest {
    private String name;
    private BigDecimal grade;
    private BigDecimal weight;
    private LocalDateTime dueDate;

    public UpdateAssignmentRequest() {}
    public UpdateAssignmentRequest(String name, BigDecimal grade, BigDecimal weight, LocalDateTime dueDate) {
        this.name = name;
        this.grade = grade;
        this.weight = weight;
        this.dueDate = dueDate;
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
