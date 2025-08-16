package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.config.JwtService;
import com.upishanker.gradehub.dto.UpdateCourseRequest;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.service.CourseService;
import com.upishanker.gradehub.dto.CreateCourseRequest;
import com.upishanker.gradehub.dto.CourseResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public CourseResponse createCourse(@RequestBody CreateCourseRequest createRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.createCourse(userId, createRequest);
    }
    @GetMapping("/{courseId}")
    public CourseResponse getCourse(@PathVariable long courseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.getCourseById(courseId, userId);
    }
    @GetMapping
    public List<CourseResponse> getCourseByUserId(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.getCoursesByUserId(userId);
    }
    @GetMapping("/{courseId}/grade")
    public BigDecimal getGradeByCourseId(@PathVariable long courseId) {
        return courseService.calculateGrade(courseId);
    }
    @PatchMapping("/{courseId}")
    public CourseResponse updateCourse(@RequestBody UpdateCourseRequest updateRequest,
                                       @PathVariable long courseId,
                                       HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return courseService.updateCourse(courseId, updateRequest, userId);
    }
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        courseService.deleteCourse(courseId, userId);
        return ResponseEntity.noContent().build();
    }
}