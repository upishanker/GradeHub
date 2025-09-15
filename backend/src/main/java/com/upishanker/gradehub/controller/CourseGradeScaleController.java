package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.model.CourseGradeScale;
import com.upishanker.gradehub.repository.CourseGradeScaleRepository;
import com.upishanker.gradehub.repository.CourseRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/gradescale")
public class CourseGradeScaleController extends BaseController {
    private final CourseRepository courseRepository;
    private final CourseGradeScaleRepository cgsRepository;

    public CourseGradeScaleController(CourseRepository courseRepository, CourseGradeScaleRepository cgsRepository) {
        this.courseRepository = courseRepository;
        this.cgsRepository = cgsRepository;
    }

    @GetMapping
    public List<CourseGradeScaleDto> getScale(@PathVariable Long courseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found"));
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden");
        }
        return cgsRepository.findByCourseId(courseId).stream()
                .map(r -> new CourseGradeScaleDto(r.getId(), r.getLetter(), r.getMinPercent()))
                .toList();
    }

    @PutMapping
    @Transactional
    public void replaceScale(@PathVariable Long courseId, @RequestBody List<CourseGradeScaleDto> body, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found"));
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden");
        }

        // Replace all with new rows
        cgsRepository.deleteByCourseId(courseId);
        List<CourseGradeScale> rows = body.stream().map(dto -> {
            CourseGradeScale r = new CourseGradeScale();
            r.setCourse(course);
            r.setLetter(dto.letter());
            r.setMinPercent(dto.minPercent());
            return r;
        }).toList();
        cgsRepository.saveAll(rows);
    }

    public record CourseGradeScaleDto(Long id, String letter, double minPercent) {}
}
