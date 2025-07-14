package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.CategoryResponse;
import com.upishanker.gradehub.dto.CreateCategoryRequest;
import com.upishanker.gradehub.dto.UpdateCategoryRequest;
import com.upishanker.gradehub.service.CategoryService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Validated
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    @PostMapping
    public CategoryResponse createCategory(@RequestBody CreateCategoryRequest createCategoryRequest) {
        return categoryService.createCategory(createCategoryRequest);
    }
    @GetMapping
    public List<CategoryResponse> getCategoriesByCourseId(@RequestParam(name = "courseId") long courseId) {
        return categoryService.getCategoriesForCourse(courseId);
    }
    @PatchMapping("/{categoryId}")
    public CategoryResponse updateCategory(@PathVariable long categoryId, @RequestBody UpdateCategoryRequest updateCategoryRequest) {
        return categoryService.updateCategory(categoryId, updateCategoryRequest);
    }
    @DeleteMapping("/{categoryId}")
    public void deleteCategory(@PathVariable long categoryId) {
        categoryService.deleteCategory(categoryId);
    }
}
