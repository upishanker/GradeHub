package com.upishanker.gradehub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private String name;
    private double goal;
    private String semester;
    private double creditHours;
    private BigDecimal grade;
    @OneToMany(mappedBy = "course" , cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Assignment> assignments = new ArrayList<>();

    public Course() {}
    public Course(User user, String name, String semester, double goal, BigDecimal grade) {
        this.user = user;
        this.name = name;
        this.semester = semester;
        this.goal = goal;
        this.grade = grade;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public double getGoal() {
        return goal;
    }
    public void setGoal(double goal) {
        this.goal = goal;
    }
    public String getSemester() {
        return semester;
    }
    public void setSemester(String semester) {
        this.semester = semester;
    }
    public double getCreditHours() {return creditHours;}
    public void setCreditHours(double creditHours) {this.creditHours = creditHours;}
    public BigDecimal getGrade() {return grade;}
    public void setGrade(BigDecimal grade) {this.grade = grade;}
    public List<Assignment> getAssignments() {
        return assignments;
    }
    public void setAssignments(List<Assignment> assignments) {
        this.assignments = assignments;
    }
}
