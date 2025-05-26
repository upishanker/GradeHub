package com.upishanker.gradehub.service;

import com.upishanker.gradehub.dto.CreateCourseRequest;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.CourseRepository;
import com.upishanker.gradehub.dto.UpdateCourseRequest;
import com.upishanker.gradehub.dto.CourseResponse;
import com.upishanker.gradehub.repository.UserRepository;
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
    @Autowired
    private UserRepository userRepository;

    public CourseResponse createCourse(CreateCourseRequest createRequest) {
        User user = userRepository.findById(createRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = new Course();
        course.setUser(user);
        course.setName(createRequest.getName());
        course.setGoal(createRequest.getGoal());
        course.setSemester(createRequest.getSemester());
        course.setCreditHours(createRequest.getCreditHours());

        courseRepository.save(course);
        return new CourseResponse(
                user.getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours()
        );
    }
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return new CourseResponse(
                course.getUser().getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours()
        );
    }
    public List<CourseResponse> getCoursesByUserId(Long userId) {
        return courseRepository.findByUserId(userId).stream()
                .map(course -> new CourseResponse(
                        course.getUser().getId(),
                        course.getId(),
                        course.getName(),
                        course.getGoal(),
                        course.getSemester(),
                        course.getCreditHours()
                ))
                .toList();
    }
    public CourseResponse getCourseByNameAndUserId(String name, Long userId) {
        Course course = courseRepository.findByNameAndUserId(name, userId);
        return new CourseResponse(
                course.getUser().getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours()
        );
    }
    public CourseResponse updateCourse(Long id, UpdateCourseRequest updateRequest) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (updateRequest.getName() != null) {
            course.setName(updateRequest.getName());
        }
        if (updateRequest.getGoal() != null) {
            course.setGoal(updateRequest.getGoal());
        }
        if (updateRequest.getSemester() != null) {
            course.setSemester(updateRequest.getSemester());
        }
        if (updateRequest.getCreditHours() != null) {
            course.setCreditHours(updateRequest.getCreditHours());
        }
        courseRepository.save(course);
        return new CourseResponse(
                course.getUser().getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours()
        );
    }
    public BigDecimal calculateGrade(Long courseId){
        BigDecimal totalWeight = BigDecimal.ZERO;
        BigDecimal totalGrade = BigDecimal.ZERO;
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        List<Assignment> assignments = course.getAssignments();
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