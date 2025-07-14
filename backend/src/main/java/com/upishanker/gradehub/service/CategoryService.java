package com.upishanker.gradehub.service;

import com.upishanker.gradehub.dto.AssignmentResponse;
import com.upishanker.gradehub.dto.CategoryResponse;
import com.upishanker.gradehub.dto.CreateCategoryRequest;
import com.upishanker.gradehub.dto.UpdateCategoryRequest;
import com.upishanker.gradehub.exceptions.CategoryNotFoundException;
import com.upishanker.gradehub.exceptions.CourseNotFoundException;
import com.upishanker.gradehub.model.Category;
import com.upishanker.gradehub.model.Course;
import com.upishanker.gradehub.repository.CategoryRepository;
import com.upishanker.gradehub.repository.CourseRepository;
import com.upishanker.gradehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private CourseRepository courseRepository;

    public CategoryResponse createCategory(CreateCategoryRequest createCategoryRequest) {
        Course course = courseRepository.findById(createCategoryRequest.courseId())
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + createCategoryRequest.courseId()));
        Category category = new Category();
        category.setCourse(course);
        category.setName(createCategoryRequest.name());
        category.setWeight(createCategoryRequest.weight());
        categoryRepository.save(category);
        return new CategoryResponse(
            category.getId(),
            category.getCourse().getId(),
            category.getName(),
            category.getWeight()
        );
    }
    public CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest updateCategoryRequest) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with ID: " + categoryId));
        if (updateCategoryRequest.getName() != null) {
            category.setName(updateCategoryRequest.getName());
        }
        if (updateCategoryRequest.getWeight() != null) {
            category.setWeight(updateCategoryRequest.getWeight());
        }
        categoryRepository.save(category);
        return new CategoryResponse(
                category.getId(),
                category.getCourse().getId(),
                category.getName(),
                category.getWeight()
        );
    }
    public List<CategoryResponse> getCategoriesForCourse(Long courseId) {
        return categoryRepository.findByCourseId(courseId).stream()
                .map(category -> new CategoryResponse(
                        category.getId(),
                        category.getCourse().getId(),
                        category.getName(),
                        category.getWeight()
                ))
                .toList();
    }
    public void deleteCategory(Long categoryId) {
        categoryRepository.deleteById(categoryId);
    }
}
