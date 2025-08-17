package com.upishanker.gradehub.repository;

import com.upishanker.gradehub.model.Category;
import com.upishanker.gradehub.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByCourseId(Long courseId);
    Category findByCourseIdAndName(Long courseId, String name);
    void deleteByCourseId(Long courseId);
}
