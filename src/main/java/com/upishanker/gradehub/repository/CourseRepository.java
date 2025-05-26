package com.upishanker.gradehub.repository;
import com.upishanker.gradehub.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface CourseRepository extends JpaRepository<Course, Long> {
    Course findByName(String name);
    List<Course> findByUserId(Long userId);
    Course findByNameAndUserId(String name,Long userId);

}