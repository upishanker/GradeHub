package com.upishanker.gradehub.service;

import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }
    public List<Course> getCoursesByUserId(Long userId) {
        return courseRepository.findByUserId(userId);
    }
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }
    public Optional<Course> getCourseByNameAndUserId(String name, Long userId) {
        return Optional.ofNullable(courseRepository.findByNameAndUserId(name, userId));
    }
    public Course updateCourse(Long id, Course updatedCourse) {
        Course currentCourse = getCourseById(id);
        currentCourse.setName(updatedCourse.getName());
        currentCourse.setSemester(updatedCourse.getSemester());
        return courseRepository.save(currentCourse);
    }
    public BigDecimal calculateGrade(Long courseId){
        BigDecimal totalWeight = BigDecimal.ZERO;
        BigDecimal totalGrade = BigDecimal.ZERO;
        List<Assignment> assignments = getCourseById(courseId).getAssignments();
        for (Assignment assignment : assignments) {
            if (assignment.getGrade() != null && assignment.getWeight() != null) {
                totalGrade = totalGrade.add(
                        assignment.getGrade().multiply(assignment.getWeight())
                );
                totalWeight = totalWeight.add(assignment.getWeight());
            }
        }
        if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
            totalGrade = totalGrade.divide(totalWeight, 2, RoundingMode.HALF_UP);
        }
        return totalGrade;
    }
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}