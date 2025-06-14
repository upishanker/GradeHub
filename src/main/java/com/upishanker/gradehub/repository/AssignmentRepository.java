package com.upishanker.gradehub.repository;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Assignment findByName(String name);
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByNameAndCourseId(String name, Long courseId);
}