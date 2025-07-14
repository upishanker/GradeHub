package com.upishanker.gradehub.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "course_id")

    private Course course;
    private String name;
    private BigDecimal grade;
    private BigDecimal weight;
    private LocalDateTime dueDate;

    public Assignment() {}
    public Assignment(Course course, String name, BigDecimal grade, BigDecimal weight, LocalDateTime dueDate) {
        this.course = course;
        this.name = name;
        this.grade = grade;
        this.weight = weight;
        this.dueDate = dueDate;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Course getCourse() {
        return course;
    }
    public void setCourse(Course course) {
        this.course = course;
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
