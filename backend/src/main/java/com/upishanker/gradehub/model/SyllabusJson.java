package com.upishanker.gradehub.model;


import java.util.Map;

public class SyllabusJson {
    private Map<String, Double> categoryWeights;
    // e.g. { "Homework": 20.0, "Exam": 50.0, ... }

    public Map<String, Double> getCategoryWeights() {
        return categoryWeights;
    }
    public void setCategoryWeights(Map<String, Double> categoryWeights) {
        this.categoryWeights = categoryWeights;
    }
}