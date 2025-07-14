package com.upishanker.gradehub.controller;
import com.upishanker.gradehub.dto.CreateAssignmentRequest;
import com.upishanker.gradehub.dto.UpdateAssignmentRequest;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.service.AssignmentService;
import com.upishanker.gradehub.dto.AssignmentResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {
    private final AssignmentService assignmentService;
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }
    @PostMapping
    public AssignmentResponse createAssignment(@RequestBody CreateAssignmentRequest createRequest) {
        return assignmentService.createAssignment(createRequest);
    }
    @GetMapping("/{assignmentId}")
    public AssignmentResponse getAssignment(@PathVariable long assignmentId) {
        return assignmentService.getAssignmentById(assignmentId);
    }
    @GetMapping()
    public List<AssignmentResponse> getAssignmentsByCourseId(@RequestParam(name = "courseId") long courseId) {
        return assignmentService.getAssignmentsByCourseId(courseId);
    }
    @GetMapping("/upcoming")
    public List<AssignmentResponse> getUpcomingAssignmentsByUserId() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return assignmentService.getUpcomingUserAssignments(userId);
    }
    @PatchMapping("/{assignmentId}")
    public AssignmentResponse updateAssignment(@RequestBody UpdateAssignmentRequest updateRequest, @PathVariable long assignmentId) {
        return assignmentService.updateAssignment(assignmentId, updateRequest);
    }
    @DeleteMapping("/{assignmentId}")
    public void deleteAssignment(@PathVariable long assignmentId) {
        assignmentService.deleteAssignment(assignmentId);
    }
}
