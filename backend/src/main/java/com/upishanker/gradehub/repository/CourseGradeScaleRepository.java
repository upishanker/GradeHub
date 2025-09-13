package com.upishanker.gradehub.repository;

import com.upishanker.gradehub.model.CourseGradeScale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseGradeScaleRepository extends JpaRepository<CourseGradeScale, Long> {
    List<CourseGradeScale> findByCourseId(Long courseId);
    void deleteByCourseId(Long courseId);
}