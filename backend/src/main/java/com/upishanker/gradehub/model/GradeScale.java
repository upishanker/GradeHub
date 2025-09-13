package com.upishanker.gradehub.model;

import jakarta.persistence.*;

@Entity
public class GradeScale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String letter;
    private Double minPercent;
    private Double gpaValue;

    public GradeScale() {}
    public GradeScale(String letter, Double minPercent, Double gpaValue) {}
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getLetter() {
        return letter;
    }
    public void setLetter(String letter) {
        this.letter = letter;
    }
    public Double getMinPercent() {
        return minPercent;
    }
    public void setMinPercent(Double minPercent) {
        this.minPercent = minPercent;
    }
    public Double getGpaValue() {
        return gpaValue;
    }
    public void setGpaValue(Double gpaValue) {
        this.gpaValue = gpaValue;
    }

}

