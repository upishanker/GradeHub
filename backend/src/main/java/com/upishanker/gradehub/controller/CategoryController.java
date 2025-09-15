package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.dto.category.Response;
import com.upishanker.gradehub.dto.category.CreateRequest;
import com.upishanker.gradehub.dto.category.UpdateRequest;
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
    public Response createCategory(@RequestBody CreateRequest createCategoryRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return categoryService.createCategory(createCategoryRequest, userId);
    }
    @GetMapping
    public List<Response> getCategoriesByCourseId(@RequestParam(name = "courseId") long courseId) {
        return categoryService.getCategoriesForCourse(courseId);
    }
    @PatchMapping("/{categoryId}")
    public Response updateCategory(@PathVariable long categoryId, @RequestBody UpdateRequest updateRequest, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return categoryService.updateCategory(categoryId, updateRequest, userId);
    }
    @DeleteMapping("/{categoryId}")
    public void deleteCategory(@PathVariable long categoryId,  HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        categoryService.deleteCategory(categoryId, userId);
    }
}
