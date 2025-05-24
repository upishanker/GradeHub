package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.UpdateCourseRequest;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.service.CourseService;
import com.upishanker.gradehub.dto.CreateCourseRequest;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private CourseService courseService;
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    @PostMapping
    public Course createCourse(@RequestBody CreateCourseRequest createRequest) {
        return courseService.createCourse(createRequest);
    }
    @GetMapping("/{courseId}")
    public Course getCourse(@PathVariable long courseId) {
        return courseService.getCourseById(courseId);
    }
    @GetMapping
    public List<Course> getCourseByUserId(@RequestParam long userId) {
        return courseService.getCoursesByUserId(userId);
    }
    @PatchMapping("/{courseId}")
    public Course updateCourse(@RequestBody UpdateCourseRequest updateRequest, @PathVariable long courseId) {
        return courseService.updateCourse(courseId, updateRequest);
    }
    @DeleteMapping("/{courseId}")
    public void deleteCourse(@PathVariable long courseId) {
        courseService.deleteCourse(courseId);
    }
}
