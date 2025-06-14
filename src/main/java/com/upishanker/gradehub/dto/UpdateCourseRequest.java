package com.upishanker.gradehub.dto;

import jakarta.validation.constraints.*;

public class UpdateCourseRequest {
    @NotBlank
    @Size(max = 100)
    private String name;
    @Min(0)
    @Max(100)
    private Double goal;
    @NotBlank
    @Size(max = 50)
    private String semester;
    @NotNull
    @Min(1)
    @Max(6)
    private Double creditHours;
    
    public UpdateCourseRequest() {}
    public UpdateCourseRequest(String name, Double goal, String semester, Double creditHours) {
        this.name = name;
        this.goal = goal;
        this.semester = semester;
        this.creditHours = creditHours;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Double getGoal() {
        return goal;
    }
    public void setGoal(Double goal) {
        this.goal = goal;
    }
    public String getSemester() {
        return semester;
    }
    public void setSemester(String semester) {
        this.semester = semester;
    }
    public Double getCreditHours() {
        return creditHours;
    }
    public void setCreditHours(Double creditHours) {
        this.creditHours = creditHours;
    }
}
