package com.upishanker.gradehub.service;

import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.repository.AssignmentRepository;
import com.upishanker.gradehub.dto.CreateAssignmentRequest;
import com.upishanker.gradehub.dto.UpdateAssignmentRequest;
import com.upishanker.gradehub.repository.CourseRepository;
import com.upishanker.gradehub.dto.AssignmentResponse;
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
    public AssignmentResponse createAssignment(CreateAssignmentRequest createRequest) {
        Course course = courseRepository.findById(createRequest.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setName(createRequest.getName());
        assignment.setGrade(createRequest.getGrade());
        assignment.setWeight(createRequest.getWeight());
        assignment.setDueDate(createRequest.getDueDate());
        assignmentRepository.save(assignment);
        return new AssignmentResponse(
                assignment.getCourse().getId(),
                assignment.getId(),
                assignment.getName(),
                assignment.getGrade(),
                assignment.getWeight(),
                assignment.getDueDate()
        );
    }
    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }
    public AssignmentResponse updateAssignment(Long id, UpdateAssignmentRequest updateRequest) {
        Assignment assignment = getAssignmentById(id);
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
        return new AssignmentResponse(
                assignment.getCourse().getId(),
                assignment.getId(),
                assignment.getName(),
                assignment.getGrade(),
                assignment.getWeight(),
                assignment.getDueDate()
        );
    }
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }
    public List<Assignment> getAssignmentsByCourseId(Long courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }
    public List<Assignment> getAssignmentsByNameAndCourseId(String name, Long courseId) {
        return assignmentRepository.findByNameAndCourseId(name, courseId);
    }
    public List<Assignment> getUpcomingAssignments(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        List<Assignment> upcoming = new ArrayList<>();
        LocalDateTime current = LocalDateTime.now();
        for (Assignment assignment : assignments) {
            if (assignment.getDueDate() != null && assignment.getDueDate().isBefore(current.plusDays(7))) {
                upcoming.add(assignment);
            }
        }
        return upcoming;
    }
    public List<Assignment> getOverdueAssignments(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        List<Assignment> overdue = new ArrayList<>();
        LocalDateTime current = LocalDateTime.now();
        for (Assignment assignment : assignments) {
            if (assignment.getDueDate() != null && assignment.getDueDate().isBefore(current)) {
                overdue.add(assignment);
            }
        }
        return overdue;
    }
}
