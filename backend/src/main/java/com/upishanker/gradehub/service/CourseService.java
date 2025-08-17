package com.upishanker.gradehub.service;

import com.upishanker.gradehub.dto.CreateCourseRequest;
import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import com.upishanker.gradehub.exceptions.UserNotFoundException;
import com.upishanker.gradehub.repository.AssignmentRepository;
import org.springframework.security.access.AccessDeniedException;
import com.upishanker.gradehub.model.Category;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.CategoryRepository;
import com.upishanker.gradehub.repository.CourseRepository;
import com.upishanker.gradehub.dto.UpdateCourseRequest;
import com.upishanker.gradehub.dto.CourseResponse;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;

    public CourseResponse createCourse(Long userId, CreateCourseRequest createRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        Course course = new Course();
        course.setUser(user);
        course.setName(createRequest.name());
        course.setGoal(createRequest.goal());
        course.setSemester(createRequest.semester());
        course.setCreditHours(createRequest.creditHours());

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

    public CourseResponse getCourseById(Long id, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + id));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this course");
        }

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

    public CourseResponse updateCourse(Long id, UpdateCourseRequest updateRequest, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + id));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this course");
        }

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

    public BigDecimal calculateGrade(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this course");
        }

        BigDecimal totalGrade = BigDecimal.ZERO;
        List<Category> categories = categoryRepository.findByCourseId(course.getId());
        for (Category category : categories) {
            List<Assignment> categoryAssignments = category.getAssignments();
            if (categoryAssignments.isEmpty()) continue;

            BigDecimal subGrade = BigDecimal.ZERO;
            int gradedCount = 0;

            for (Assignment assignment : categoryAssignments) {
                if (assignment.getGrade() != null) {
                    subGrade = subGrade.add(assignment.getGrade());
                    gradedCount++;
                }
            }

            if (gradedCount > 0) {
                BigDecimal average = subGrade.divide(BigDecimal.valueOf(gradedCount), 2, RoundingMode.HALF_UP);
                totalGrade = totalGrade.add(average.multiply(category.getWeight().divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP)));
            }
        }
        List<Assignment> assignments = course.getAssignments();
        for (Assignment assignment : assignments) {
            if (assignment.getGrade() != null && assignment.getWeight() != null && assignment.getCategory() == null) {
                totalGrade = totalGrade.add(
                        assignment.getGrade().multiply(assignment.getWeight().divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP))
                );
            }
        }
        return totalGrade;
    }

    // Internal method for UserService - no auth check needed since it's called internally
    public BigDecimal calculateGrade(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        BigDecimal totalGrade = BigDecimal.ZERO;
        List<Category> categories = categoryRepository.findByCourseId(course.getId());
        for (Category category : categories) {
            List<Assignment> categoryAssignments = category.getAssignments();
            if (categoryAssignments.isEmpty()) continue;

            BigDecimal subGrade = BigDecimal.ZERO;
            int gradedCount = 0;

            for (Assignment assignment : categoryAssignments) {
                if (assignment.getGrade() != null) {
                    subGrade = subGrade.add(assignment.getGrade());
                    gradedCount++;
                }
            }

            if (gradedCount > 0) {
                BigDecimal average = subGrade.divide(BigDecimal.valueOf(gradedCount), 2, RoundingMode.HALF_UP);
                totalGrade = totalGrade.add(average.multiply(category.getWeight().divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP)));
            }
        }
        List<Assignment> assignments = course.getAssignments();
        for (Assignment assignment : assignments) {
            if (assignment.getGrade() != null && assignment.getWeight() != null && assignment.getCategory() == null) {
                totalGrade = totalGrade.add(
                        assignment.getGrade().multiply(assignment.getWeight().divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP))
                );
            }
        }
        return totalGrade;
    }
    @Transactional
    public void deleteCourse(Long id, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + id));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this course");
        }

        // Delete all assignments associated with this course first
        assignmentRepository.deleteByCourseId(id);

        // Delete all categories associated with this course
        categoryRepository.deleteByCourseId(id);

        // Now delete the course
        courseRepository.deleteById(id);
    }
}