package com.upishanker.gradehub.dto.category;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class UpdateRequest {
    @NotBlank
    @Size(max = 100)
    private String name;
    @NotNull
    @Min(0)
    @Max(100)
    private BigDecimal weight;

    public UpdateRequest() {
    }

    public UpdateRequest(String name, BigDecimal weight) {
        this.name = name;
        this.weight = weight;
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
