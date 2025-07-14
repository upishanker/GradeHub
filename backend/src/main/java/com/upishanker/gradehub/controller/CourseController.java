package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.UpdateCourseRequest;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.service.CourseService;
import com.upishanker.gradehub.dto.CreateCourseRequest;
import com.upishanker.gradehub.dto.CourseResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    @PostMapping
    public CourseResponse createCourse(@RequestBody CreateCourseRequest createRequest) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return courseService.createCourse(userId, createRequest);
    }
    @GetMapping("/{courseId}")
    public CourseResponse getCourse(@PathVariable long courseId) {
        return courseService.getCourseById(courseId);
    }
    @GetMapping
    public List<CourseResponse> getCourseByUserId() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return courseService.getCoursesByUserId(userId);
    }
    @GetMapping("/{courseId}/grade")
    public BigDecimal getGradeByCourseId(@PathVariable long courseId) {
        return courseService.calculateGrade(courseId);
    }
    @PatchMapping("/{courseId}")
    public CourseResponse updateCourse(@RequestBody UpdateCourseRequest updateRequest, @PathVariable long courseId) {
        return courseService.updateCourse(courseId, updateRequest);
    }
    @DeleteMapping("/{courseId}")
    public void deleteCourse(@PathVariable long courseId) {
        courseService.deleteCourse(courseId);
    }
}
