package com.upishanker.gradehub.model;

import jakarta.persistence.*;

@Entity
public class GradeScale {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    private String letter;
    private Double gpaValue;

    public GradeScale() {}
    public GradeScale(String letter, Double minPercent, Double gpaValue) {}
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
    public String getLetter() {
        return letter;
    }
    public void setLetter(String letter) {
        this.letter = letter;
    }
    public Double getGpaValue() {
        return gpaValue;
    }
    public void setGpaValue(Double gpaValue) {
        this.gpaValue = gpaValue;
    }

}

