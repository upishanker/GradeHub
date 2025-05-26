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
    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return new AssignmentResponse(
                assignment.getCourse().getId(),
                assignment.getId(),
                assignment.getName(),
                assignment.getGrade(),
                assignment.getWeight(),
                assignment.getDueDate()
        );
    }
    public AssignmentResponse updateAssignment(Long id, UpdateAssignmentRequest updateRequest) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
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
    public List<AssignmentResponse> getAssignmentsByCourseId(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(assignment -> new AssignmentResponse(
                        assignment.getCourse().getId(),
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getGrade(),
                        assignment.getWeight(),
                        assignment.getDueDate()
                ))
                .toList();
    }
    public List<AssignmentResponse> getAssignmentsByNameAndCourseId(String name, Long courseId) {
        return assignmentRepository.findByNameAndCourseId(name, courseId).stream()
                .map(assignment -> new AssignmentResponse(
                        assignment.getCourse().getId(),
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getGrade(),
                        assignment.getWeight(),
                        assignment.getDueDate()
                ))
                .toList();
    }
    public List<AssignmentResponse> getUpcomingAssignments(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        List<AssignmentResponse> upcoming = new ArrayList<>();
        LocalDateTime current = LocalDateTime.now();
        for (Assignment assignment : assignments) {
            if (assignment.getDueDate() != null && assignment.getDueDate().isBefore(current.plusDays(7))) {
                upcoming.add(new AssignmentResponse(
                        assignment.getCourse().getId(),
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
    public List<AssignmentResponse> getOverdueAssignments(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        List<AssignmentResponse> overdue = new ArrayList<>();
        LocalDateTime current = LocalDateTime.now();
        for (Assignment assignment : assignments) {
            if (assignment.getDueDate() != null && assignment.getDueDate().isBefore(current)) {
                overdue.add(new AssignmentResponse(
                        assignment.getCourse().getId(),
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
