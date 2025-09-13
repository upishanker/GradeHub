package com.upishanker.gradehub.service;

import com.upishanker.gradehub.dto.CreateCourseRequest;
import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import com.upishanker.gradehub.exceptions.UserNotFoundException;
import com.upishanker.gradehub.model.*;
import com.upishanker.gradehub.repository.*;
import org.springframework.security.access.AccessDeniedException;
import com.upishanker.gradehub.dto.UpdateCourseRequest;
import com.upishanker.gradehub.dto.CourseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired private CourseGradeScaleRepository courseGradeScaleRepository;
    @Autowired private GradeScaleRepository gradeScaleRepository;
    public CourseResponse createCourse(Long userId, CreateCourseRequest createRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        Course course = new Course();
        course.setUser(user);
        course.setName(createRequest.name());
        course.setGoal(createRequest.goal());
        course.setSemester(createRequest.semester());
        course.setCreditHours(createRequest.creditHours());

        courseRepository.save(course);

        // Create default course grade scales
        List<CourseGradeScale> defaultScales = CourseGradeScale.createDefaultGradeScales(course);
        courseGradeScaleRepository.saveAll(defaultScales);

        // Calculate grade and letter grade
        BigDecimal grade = calculateCourseGradeNormalized(course);
        String letterGrade = mapPercentToLetter(course.getId(), grade);

        return new CourseResponse(
                user.getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours(),
                grade,
                letterGrade
        );
    }

    public CourseResponse getCourseById(Long id, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + id));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this course");
        }

        // Calculate grade and letter grade
        BigDecimal grade = calculateCourseGradeNormalized(course);
        String letterGrade = mapPercentToLetter(course.getId(), grade);

        return new CourseResponse(
                course.getUser().getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours(),
                grade,
                letterGrade
        );
    }

    public List<CourseResponse> getCoursesByUserId(Long userId) {
        return courseRepository.findByUserId(userId).stream()
                .map(course -> {
                    BigDecimal grade = calculateCourseGradeNormalized(course);
                    String letterGrade = mapPercentToLetter(course.getId(), grade);
                    return new CourseResponse(
                            course.getUser().getId(),
                            course.getId(),
                            course.getName(),
                            course.getGoal(),
                            course.getSemester(),
                            course.getCreditHours(),
                            grade,
                            letterGrade
                    );
                })
                .toList();
    }

    public CourseResponse getCourseByNameAndUserId(String name, Long userId) {
        Course course = courseRepository.findByNameAndUserId(name, userId);

        // Calculate grade and letter grade
        BigDecimal grade = calculateCourseGradeNormalized(course);
        String letterGrade = mapPercentToLetter(course.getId(), grade);

        return new CourseResponse(
                course.getUser().getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours(),
                grade,
                letterGrade
        );
    }

    public CourseResponse updateCourse(Long id, UpdateCourseRequest updateRequest, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + id));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this course");
        }

        if (updateRequest.getName() != null) {
            course.setName(updateRequest.getName());
        }
        if (updateRequest.getGoal() != null) {
            course.setGoal(updateRequest.getGoal());
        }
        if (updateRequest.getSemester() != null) {
            course.setSemester(updateRequest.getSemester());
        }
        if (updateRequest.getCreditHours() != null) {
            course.setCreditHours(updateRequest.getCreditHours());
        }
        courseRepository.save(course);

        // Calculate grade and letter grade
        BigDecimal grade = calculateCourseGradeNormalized(course);
        String letterGrade = mapPercentToLetter(course.getId(), grade);

        return new CourseResponse(
                course.getUser().getId(),
                course.getId(),
                course.getName(),
                course.getGoal(),
                course.getSemester(),
                course.getCreditHours(),
                grade,
                letterGrade
        );
    }

    public BigDecimal calculateGrade(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this course");
        }

        return calculateCourseGradeNormalized(course);
    }

    public BigDecimal calculateGrade(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));

        return calculateCourseGradeNormalized(course);
    }

    /**
     * Computes course grade considering only graded work and normalizing by the sum of
     * weights that actually contributed. If nothing is graded, returns 0.00.
     */
    private BigDecimal calculateCourseGradeNormalized(Course course) {
        // Accumulators
        BigDecimal weightedSum = BigDecimal.ZERO;    // sum of (componentScore * componentWeight)
        BigDecimal effectiveWeightSum = BigDecimal.ZERO; // sum of componentWeight for components that contributed

        // 1) Category-based assignments
        List<Category> categories = categoryRepository.findByCourseId(course.getId());
        for (Category category : categories) {
            List<Assignment> categoryAssignments = category.getAssignments();
            if (categoryAssignments == null || categoryAssignments.isEmpty()) continue;

            BigDecimal subSum = BigDecimal.ZERO;
            int gradedCount = 0;

            for (Assignment assignment : categoryAssignments) {
                if (assignment.getGrade() != null) {
                    subSum = subSum.add(assignment.getGrade());
                    gradedCount++;
                }
            }

            // Only count this category if it has at least one graded assignment AND has a weight
            if (gradedCount > 0 && category.getWeight() != null) {
                // Category average (0-100 scale assumed)
                BigDecimal average = subSum.divide(BigDecimal.valueOf(gradedCount), 4, RoundingMode.HALF_UP);

                // Category weight as a percentage value (e.g., 20 means 20%)
                BigDecimal categoryWeightPct = category.getWeight(); // e.g., 20

                // Contribute average * weightPct (keep consistent units)
                weightedSum = weightedSum.add(average.multiply(categoryWeightPct));
                effectiveWeightSum = effectiveWeightSum.add(categoryWeightPct);
            }
        }

        // 2) Standalone assignments (no category)
        List<Assignment> assignments = course.getAssignments();
        for (Assignment assignment : assignments) {
            if (assignment.getCategory() != null) continue;    // not standalone
            if (assignment.getGrade() == null) continue;    // ungraded
            if (assignment.getWeight() == null) continue;    // no weight to apply

            BigDecimal weightPct = assignment.getWeight();    // e.g., 20
            // Contribute grade * weightPct
            weightedSum = weightedSum.add(assignment.getGrade().multiply(weightPct));
            effectiveWeightSum = effectiveWeightSum.add(weightPct);
        }

        // If nothing graded, return 0.00
        if (effectiveWeightSum.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        // Normalize: (sum(score * weightPct)) / (sum(weightPct))
        BigDecimal normalized = weightedSum.divide(effectiveWeightSum, 4, RoundingMode.HALF_UP);

        // Return with 2-decimal scale
        return normalized.setScale(2, RoundingMode.HALF_UP);
    }
    public String mapPercentToLetter(Long courseId, BigDecimal percent) {
        if (percent == null) return "No percent";

        List<CourseGradeScale> rows = courseGradeScaleRepository.findByCourseId(courseId);
        if (rows == null || rows.isEmpty()) return "No rows";

        rows.sort(java.util.Comparator.comparing(CourseGradeScale::getMinPercent).reversed());
        double p = percent.doubleValue();

        for (CourseGradeScale r : rows) {
            if (p >= r.getMinPercent()) return r.getLetter();
        }
        return "F";
    }

    public BigDecimal mapLetterToUserGpa(Long userId, String letter) {
        if (letter == null) return null;
        GradeScale gs = gradeScaleRepository.findByUserIdAndLetter(userId, letter);
        return gs != null && gs.getGpaValue() != null ? BigDecimal.valueOf(gs.getGpaValue()) : null;
    }
    @Transactional
    public void deleteCourse(Long id, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + id));

        // Verify user owns the course
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this course");
        }

        // Delete all assignments associated with this course first
        assignmentRepository.deleteByCourseId(id);

        // Delete all categories associated with this course
        categoryRepository.deleteByCourseId(id);

        // Now delete the course
        courseRepository.deleteById(id);
    }
}