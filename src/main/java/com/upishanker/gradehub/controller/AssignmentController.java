package com.upishanker.gradehub.controller;
import com.upishanker.gradehub.dto.CreateAssignmentRequest;
import com.upishanker.gradehub.dto.UpdateAssignmentRequest;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.service.AssignmentService;
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
    public Assignment createAssignment(@RequestBody CreateAssignmentRequest createRequest) {
        return assignmentService.createAssignment(createRequest);
    }
    @GetMapping("/{assignmentId}")
    public Assignment getAssignment(@PathVariable long assignmentId) {
        return assignmentService.getAssignmentById(assignmentId);
    }
    @GetMapping()
    public List<Assignment> getAssignmentsByCourseId(@RequestParam long courseId) {
        return assignmentService.getAssignmentsByCourseId(courseId);
    }
    @PatchMapping("/{assignmentId}")
    public Assignment updateAssignment(@RequestBody UpdateAssignmentRequest updateRequest, @PathVariable long assignmentId) {
        return assignmentService.updateAssignment(assignmentId, updateRequest);
    }
    @DeleteMapping("/{assignmentId}")
    public void deleteAssignment(@PathVariable long assignmentId) {
        assignmentService.deleteAssignment(assignmentId);
    }
}
