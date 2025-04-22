package com.upishanker.gradehub.service;

import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;
@Service

public class AssignmentService {
    @Autowired
    private AssignmentRepository assignmentRepository;
    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }
    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }
    public Assignment updateAssignment(Long id, Assignment updatedAssignment) {
        Assignment currentAssignment = getAssignmentById(id);
        currentAssignment.setName(updatedAssignment.getName());
        currentAssignment.setGrade(updatedAssignment.getGrade());
        currentAssignment.setWeight(updatedAssignment.getWeight());
        currentAssignment.setDueDate(updatedAssignment.getDueDate());
        return assignmentRepository.save(currentAssignment);
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
