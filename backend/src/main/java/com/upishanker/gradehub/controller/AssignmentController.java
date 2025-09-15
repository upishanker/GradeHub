package com.upishanker.gradehub.controller;
import com.upishanker.gradehub.dto.assignment.CreateRequest;
import com.upishanker.gradehub.dto.assignment.UpdateRequest;
import com.upishanker.gradehub.service.AssignmentService;
import com.upishanker.gradehub.dto.assignment.Response;
import jakarta.servlet.http.HttpServletRequest;
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
    public Response createAssignment(@RequestBody CreateRequest createRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.createAssignment(createRequest,  userId);
    }
    @GetMapping("/{assignmentId}")
    public Response getAssignment(@PathVariable long assignmentId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getAssignmentById(assignmentId, userId);
    }
    @GetMapping(params = "courseId")
    public List<Response> getAssignmentsByCourseId(@RequestParam long courseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getAssignmentsByCourseId(courseId, userId);
    }
    @GetMapping(params = "categoryId")
    public List<Response> getAssignmentsByCategoryId(@RequestParam long categoryId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getAssignmentsByCategoryId(categoryId, userId);
    }
    @GetMapping("/upcoming")
    public List<Response> getUpcomingAssignmentsByUserId(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.getUpcomingUserAssignments(userId);
    }
    @PatchMapping("/{assignmentId}")
    public Response updateAssignment(@RequestBody UpdateRequest updateRequest, @PathVariable long assignmentId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return assignmentService.updateAssignment(assignmentId, updateRequest, userId);
    }
    @DeleteMapping("/{assignmentId}")
    public void deleteAssignment(@PathVariable long assignmentId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        assignmentService.deleteAssignment(assignmentId, userId);
    }
}
