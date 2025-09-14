package com.upishanker.gradehub.repository;

import com.upishanker.gradehub.model.PastCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PastCourseRepository extends JpaRepository<PastCourse, Long> {
    List<PastCourse> findByUserId(Long userId);
    PastCourse findByNameAndUserId(String name, Long userId);
}