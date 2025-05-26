package com.upishanker.gradehub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

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
    @OneToMany(mappedBy = "course" , cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Assignment> assignments = new ArrayList<>();

    public Course() {}
    public Course(User user, String name, String semester, double goal) {
        this.user = user;
        this.name = name;
        this.semester = semester;
        this.goal = goal;
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
    public List<Assignment> getAssignments() {
        return assignments;
    }
    public void setAssignments(List<Assignment> assignments) {
        this.assignments = assignments;
    }
}
