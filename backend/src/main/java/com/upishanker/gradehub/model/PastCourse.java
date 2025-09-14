package com.upishanker.gradehub.model;

import jakarta.persistence.*;

@Entity
public class PastCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String semester;

    @Column(nullable = false)
    private double creditHours;

    @Column(nullable = false, length = 2)
    private String letterGrade;

    public PastCourse() {}
    public PastCourse(Long id, User user, String name, String letterGrade) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.letterGrade = letterGrade;
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
    public String getSemester() {
        return semester;
    }
    public void setSemester(String semester) {
        this.semester = semester;
    }
    public double getCreditHours() {
        return creditHours;
    }
    public void setCreditHours(double creditHours) {
        this.creditHours = creditHours;
    }
    public String getLetterGrade() {
        return letterGrade;
    }
    public void setLetterGrade(String letterGrade) {
        this.letterGrade = letterGrade;
    }
}
