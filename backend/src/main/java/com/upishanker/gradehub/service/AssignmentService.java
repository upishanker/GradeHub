package com.upishanker.gradehub.service;

import com.upishanker.gradehub.exceptions.AssignmentNotFoundException;
import com.upishanker.gradehub.exceptions.CategoryNotFoundException;
import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.model.Category;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.repository.AssignmentRepository;
import com.upishanker.gradehub.dto.assignment.CreateRequest;
import com.upishanker.gradehub.dto.assignment.UpdateRequest;
import com.upishanker.gradehub.repository.CourseRepository;
import com.upishanker.gradehub.repository.CategoryRepository;
import com.upishanker.gradehub.dto.assignment.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;

@Service
public class AssignmentService {
    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public Response createAssignment(CreateRequest createRequest, Long userId) {
        Course course = courseRepository.findById(createRequest.courseId())
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + createRequest.courseId()));

        // Verify user owns the course before creating assignment
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to create assignments in this course");
        }

        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        if (createRequest.categoryId() != null) {
            Category category = categoryRepository.findById(createRequest.categoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("Category not found with ID: " + createRequest.categoryId()));

            // Verify category belongs to the same course
            if (!category.getCourse().getId().equals(createRequest.courseId())) {
                throw new AccessDeniedException("Category does not belong to the specified course");
            }

            assignment.setCategory(category);
        }
        assignment.setName(createRequest.name());
        assignment.setGrade(createRequest.grade());
        assignment.setWeight(createRequest.weight());
        assignment.setDueDate(createRequest.dueDate());
        assignmentRepository.save(assignment);
        return new Response(
                assignment.getCourse().getId(),
                assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                assignment.getId(),
                assignment.getName(),
                assignment.getGrade(),
                assignment.getWeight(),
                assignment.getDueDate()
        );
    }

    public Response getAssignmentById(Long id, Long userId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found with ID: " + id));

        // Verify user owns the course that contains this assignment
        if (!assignment.getCourse().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this assignment");
        }

        return new Response(
                assignment.getCourse().getId(),
                assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                assignment.getId(),
                assignment.getName(),
                assignment.getGrade(),
                assignment.getWeight(),
                assignment.getDueDate()
        );
    }

    public Response updateAssignment(Long id, UpdateRequest updateRequest, Long userId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found with ID: " + id));

        // Check if user owns the course that contains this assignment
        if (!assignment.getCourse().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this assignment");
        }

        if (updateRequest.getName() != null) {
            assignment.setName(updateRequest.getName());
        }
        if (updateRequest.getGrade() != null) {
            assignment.setGrade(updateRequest.getGrade());
        }
        if (updateRequest.getWeight() != null) {
            assignment.setWeight(updateRequest.getWeight());
        }
        if (updateRequest.getDueDate() != null) {
            assignment.setDueDate(updateRequest.getDueDate());
        }
        assignmentRepository.save(assignment);
        return new Response(
                assignment.getCourse().getId(),
                assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                assignment.getId(),
                assignment.getName(),
                assignment.getGrade(),
                assignment.getWeight(),
                assignment.getDueDate()
        );
    }

    public void deleteAssignment(Long id, Long userId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found with ID: " + id));

        // Check if user owns the course that contains this assignment
        if (!assignment.getCourse().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this assignment");
        }

        assignmentRepository.deleteById(id);
    }

    public List<Response> getAssignmentsByCourseId(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access assignments for this course");
        }

        return assignmentRepository.findByCourseId(courseId).stream()
                .map(assignment -> new Response(
                        assignment.getCourse().getId(),
                        assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getGrade(),
                        assignment.getWeight(),
                        assignment.getDueDate()
                ))
                .toList();
    }
    public List<Response> getAssignmentsByCategoryId(Long categoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with ID: " + categoryId));
        if (!category.getCourse().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this category");
        }
        return assignmentRepository.findByCategoryId(categoryId).stream()
                .map(assignment -> new Response(
                        assignment.getCourse().getId(),
                        assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getGrade(),
                        assignment.getWeight(),
                        assignment.getDueDate()
                ))
                .toList();
    }

    public List<Response> getAssignmentsByNameAndCourseId(String name, Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access assignments for this course");
        }

        return assignmentRepository.findByNameAndCourseId(name, courseId).stream()
                .map(assignment -> new Response(
                        assignment.getCourse().getId(),
                        assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getGrade(),
                        assignment.getWeight(),
                        assignment.getDueDate()
                ))
                .toList();
    }

    public List<Response> getUpcomingAssignments(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access assignments for this course");
        }

        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        List<Response> upcoming = new ArrayList<>();
        LocalDateTime current = LocalDateTime.now();
        for (Assignment assignment : assignments) {
            if (assignment.getDueDate() != null && assignment.getDueDate().isBefore(current.plusDays(7))) {
                upcoming.add(new Response(
                        assignment.getCourse().getId(),
                        assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getGrade(),
                        assignment.getWeight(),
                        assignment.getDueDate()
                ));
            }
        }
        return upcoming;
    }

    public List<Response> getUpcomingUserAssignments(Long userId) {
        List<Course> courses = courseRepository.findByUserId(userId);
        List<Response> upcoming = new ArrayList<>();
        LocalDateTime current = LocalDateTime.now();
        for (Course course : courses) {
            for (Assignment assignment : course.getAssignments()) {
                if (assignment.getDueDate() != null && assignment.getDueDate().isBefore(current.plusDays(7))) {
                    upcoming.add(new Response(
                            assignment.getCourse().getId(),
                            assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                            assignment.getId(),
                            assignment.getName(),
                            assignment.getGrade(),
                            assignment.getWeight(),
                            assignment.getDueDate()
                    ));
                }
            }
        }
        return upcoming;
    }

    public List<Response> getOverdueAssignments(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access assignments for this course");
        }

        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        List<Response> overdue = new ArrayList<>();
        LocalDateTime current = LocalDateTime.now();
        for (Assignment assignment : assignments) {
            if (assignment.getDueDate() != null && assignment.getDueDate().isBefore(current)) {
                overdue.add(new Response(
                        assignment.getCourse().getId(),
                        assignment.getCategory() != null ? assignment.getCategory().getId() : null,
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getGrade(),
                        assignment.getWeight(),
                        assignment.getDueDate()
                ));
            }
        }
        return overdue;
    }
}