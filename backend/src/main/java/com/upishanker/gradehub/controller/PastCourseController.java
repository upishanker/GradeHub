package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.CreatePastCourseRequest;
import com.upishanker.gradehub.dto.PastCourseResponse;
import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import com.upishanker.gradehub.exceptions.UserNotFoundException;
import com.upishanker.gradehub.model.PastCourse;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.PastCourseRepository;
import com.upishanker.gradehub.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pastcourses")
public class PastCourseController extends BaseController {
    private final PastCourseRepository pcRepository;
    private final UserRepository userRepository;
    public PastCourseController(PastCourseRepository pcRepository, UserRepository userRepository) {
        this.pcRepository = pcRepository;
        this.userRepository = userRepository;
    }
    @GetMapping
    public List<PastCourseResponse> getPastCourses(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return pcRepository.findByUserId(userId).stream()
                .map(pc -> new PastCourseResponse(userId, pc.getId(), pc.getName(), pc.getSemester(), pc.getCreditHours(), pc.getLetterGrade()))
                .toList();
    }
    @GetMapping("/{pastCourseId}")
    public PastCourseResponse getPastCourse(@PathVariable long pastCourseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        PastCourse pastCourse = pcRepository.findById(pastCourseId)
                .orElseThrow(() -> new CourseNotFoundException("Past course not found"));
        if (!pastCourse.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden");
        }
        return new PastCourseResponse(
                pastCourse.getUser().getId(),
                pastCourse.getId(),
                pastCourse.getName(),
                pastCourse.getSemester(),
                pastCourse.getCreditHours(),
                pastCourse.getLetterGrade()
        );
    }
    @PostMapping
    public PastCourseResponse createPastCourse(@Valid @RequestBody CreatePastCourseRequest createRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        User user =  userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        PastCourse pastCourse = new PastCourse();
        pastCourse.setUser(user);
        pastCourse.setName(createRequest.name());
        pastCourse.setSemester(createRequest.semester());
        pastCourse.setCreditHours(createRequest.creditHours());
        pastCourse.setLetterGrade(createRequest.letterGrade());
        pcRepository.save(pastCourse);

        return new PastCourseResponse(
                user.getId(),
                pastCourse.getId(),
                pastCourse.getName(),
                pastCourse.getSemester(),
                pastCourse.getCreditHours(),
                pastCourse.getLetterGrade()
        );
    }
    @DeleteMapping("/{pastCourseId}")
    public void deletePastCourse(@PathVariable long pastCourseId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        PastCourse pastCourse = pcRepository.findById(pastCourseId)
                .orElseThrow(() -> new CourseNotFoundException("Past course not found"));
        if (!pastCourse.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden");
        }
        pcRepository.delete(pastCourse);
    }
}
