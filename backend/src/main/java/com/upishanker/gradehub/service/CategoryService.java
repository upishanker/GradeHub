package com.upishanker.gradehub.service;

import com.upishanker.gradehub.dto.category.Response;
import com.upishanker.gradehub.dto.category.CreateRequest;
import com.upishanker.gradehub.dto.category.UpdateRequest;
import com.upishanker.gradehub.exceptions.CategoryNotFoundException;
import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import com.upishanker.gradehub.model.Category;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.repository.CategoryRepository;
import com.upishanker.gradehub.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private CourseRepository courseRepository;

    public Response createCategory(CreateRequest createCategoryRequest, Long userId) {
        Course course = courseRepository.findById(createCategoryRequest.courseId())
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + createCategoryRequest.courseId()));
        if (!course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to create assignments in this course");
        }
        Category category = new Category();
        category.setCourse(course);
        category.setName(createCategoryRequest.name());
        category.setWeight(createCategoryRequest.weight());
        categoryRepository.save(category);
        return new Response(
            category.getId(),
            category.getCourse().getId(),
            category.getName(),
            category.getWeight()
        );
    }
    public Response updateCategory(Long categoryId, UpdateRequest updateRequest, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with ID: " + categoryId));
        if (!category.getCourse().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to create assignments in this course");
        }
        if (updateRequest.getName() != null) {
            category.setName(updateRequest.getName());
        }
        if (updateRequest.getWeight() != null) {
            category.setWeight(updateRequest.getWeight());
        }
        categoryRepository.save(category);
        return new Response(
                category.getId(),
                category.getCourse().getId(),
                category.getName(),
                category.getWeight()
        );
    }
    public List<Response> getCategoriesForCourse(Long courseId) {
        return categoryRepository.findByCourseId(courseId).stream()
                .map(category -> new Response(
                        category.getId(),
                        category.getCourse().getId(),
                        category.getName(),
                        category.getWeight()
                ))
                .toList();
    }
    public void deleteCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with ID: " + categoryId));
        if (!category.getCourse().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete categories in this course");
        }
        categoryRepository.deleteById(categoryId);
    }
}
