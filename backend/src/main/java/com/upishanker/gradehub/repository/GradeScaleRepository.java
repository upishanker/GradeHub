package com.upishanker.gradehub.repository;

import com.upishanker.gradehub.model.GradeScale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GradeScaleRepository extends JpaRepository<GradeScale, Long> {
    List<GradeScale> findAllByOrderByMinPercentDesc();
}
