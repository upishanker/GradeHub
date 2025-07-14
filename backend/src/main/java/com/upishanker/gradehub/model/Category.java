package com.upishanker.gradehub.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
    private String name;
    private BigDecimal weight;

    public Category() {}
    public Category(Course course, String name, BigDecimal weight) {
        this.course = course;
        this.name = name;
        this.weight = weight;
    }
    public long getId() {
            return id;
    }
    public void setId(long id) {
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
    public BigDecimal getWeight() {
        return weight;
    }
    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
}
