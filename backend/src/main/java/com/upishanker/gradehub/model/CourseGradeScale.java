package com.upishanker.gradehub.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
public class CourseGradeScale {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id")
    private Course course;


    private String letter;

    private double minPercent;

    public CourseGradeScale() {}
    public CourseGradeScale(Course course, String letter, double minPercent) {
        this.course = course;
        this.letter = letter;
        this.minPercent = minPercent;
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
    public String getLetter() {
        return letter;
    }
    public void setLetter(String letter) {
        this.letter = letter;
    }
    public double getMinPercent() {
        return minPercent;
    }
    public void setMinPercent(double minPercent) {
        this.minPercent = minPercent;
    }

    public static List<CourseGradeScale> createDefaultGradeScales(Course course) {
        List<CourseGradeScale> defaultScales = new ArrayList<>();

        defaultScales.add(new CourseGradeScale(course, "A", 92.0));
        defaultScales.add(new CourseGradeScale(course, "A-", 90.0));
        defaultScales.add(new CourseGradeScale(course, "B+", 87.0));
        defaultScales.add(new CourseGradeScale(course, "B", 82.0));
        defaultScales.add(new CourseGradeScale(course, "B-", 80.0));
        defaultScales.add(new CourseGradeScale(course, "C+", 77.0));
        defaultScales.add(new CourseGradeScale(course, "C", 72.0));
        defaultScales.add(new CourseGradeScale(course, "C-", 70.0));
        defaultScales.add(new CourseGradeScale(course, "D+", 67.0));
        defaultScales.add(new CourseGradeScale(course, "D", 62.0));
        defaultScales.add(new CourseGradeScale(course, "D-", 60.0));
        defaultScales.add(new CourseGradeScale(course, "F", 0.0));

        return defaultScales;
    }
}