package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.CategoryResponse;
import com.upishanker.gradehub.dto.CreateCategoryRequest;
import com.upishanker.gradehub.dto.UpdateCategoryRequest;
import com.upishanker.gradehub.service.CategoryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Validated
public class CategoryController extends BaseController{
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    @PostMapping
    public CategoryResponse createCategory(@RequestBody CreateCategoryRequest createCategoryRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return categoryService.createCategory(createCategoryRequest, userId);
    }
    @GetMapping
    public List<CategoryResponse> getCategoriesByCourseId(@RequestParam(name = "courseId") long courseId) {
        return categoryService.getCategoriesForCourse(courseId);
    }
    @PatchMapping("/{categoryId}")
    public CategoryResponse updateCategory(@PathVariable long categoryId, @RequestBody UpdateCategoryRequest updateCategoryRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return categoryService.updateCategory(categoryId, updateCategoryRequest, userId);
    }
    @DeleteMapping("/{categoryId}")
    public void deleteCategory(@PathVariable long categoryId,  HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        categoryService.deleteCategory(categoryId, userId);
    }
}
