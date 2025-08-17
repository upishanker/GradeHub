package com.upishanker.gradehub.controller;
import com.upishanker.gradehub.dto.CreateAssignmentRequest;
import com.upishanker.gradehub.dto.UpdateAssignmentRequest;
import com.upishanker.gradehub.model.Assignment;
import com.upishanker.gradehub.service.AssignmentService;
import com.upishanker.gradehub.dto.AssignmentResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController extends BaseController{
    private final AssignmentService assignmentService;
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }
    @PostMapping
    public AssignmentResponse createAssignment(@RequestBody CreateAssignmentRequest createRequest,  HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.createAssignment(createRequest,  userId);
    }
    @GetMapping("/{assignmentId}")
    public AssignmentResponse getAssignment(@PathVariable long assignmentId,  HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getAssignmentById(assignmentId, userId);
    }
    @GetMapping(params = "courseId")
    public List<AssignmentResponse> getAssignmentsByCourseId(@RequestParam long courseId,  HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getAssignmentsByCourseId(courseId, userId);
    }
    @GetMapping(params = "categoryId")
    public List<AssignmentResponse> getAssignmentsByCategoryId(@RequestParam long categoryId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getAssignmentsByCategoryId(categoryId, userId);
    }
    @GetMapping("/upcoming")
    public List<AssignmentResponse> getUpcomingAssignmentsByUserId(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getUpcomingUserAssignments(userId);
    }
    @PatchMapping("/{assignmentId}")
    public AssignmentResponse updateAssignment(@RequestBody UpdateAssignmentRequest updateRequest, @PathVariable long assignmentId,  HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.updateAssignment(assignmentId, updateRequest, userId);
    }
    @DeleteMapping("/{assignmentId}")
    public void deleteAssignment(@PathVariable long assignmentId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        assignmentService.deleteAssignment(assignmentId, userId);
    }
}
