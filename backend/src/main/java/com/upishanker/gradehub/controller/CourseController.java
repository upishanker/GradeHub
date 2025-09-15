package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.config.JwtService;
import com.upishanker.gradehub.dto.course.UpdateRequest;
import com.upishanker.gradehub.service.CourseService;
import com.upishanker.gradehub.dto.course.CreateRequest;
import com.upishanker.gradehub.dto.course.Response;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController extends BaseController {
    private final CourseService courseService;
    @Autowired
    private JwtService jwtService;
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    @PostMapping
    public Response createCourse(@Valid @RequestBody CreateRequest createRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.createCourse(userId, createRequest);
    }
    @GetMapping("/{courseId}")
    public Response getCourse(@PathVariable long courseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.getCourseById(courseId, userId);
    }
    @GetMapping
    public List<Response> getCourseByUserId(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.getCoursesByUserId(userId);
    }
    @GetMapping("/{courseId}/grade")
    public BigDecimal getGradeByCourseId(@PathVariable long courseId) {
        return courseService.calculateGrade(courseId);
    }
    @PatchMapping("/{courseId}")
    public Response updateCourse(@RequestBody UpdateRequest updateRequest,
                                 @PathVariable long courseId,
                                 HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.updateCourse(courseId, updateRequest, userId);
    }
    @DeleteMapping("/{courseId}")
    public void deleteCourse(@PathVariable long courseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        courseService.deleteCourse(courseId, userId);
    }
}