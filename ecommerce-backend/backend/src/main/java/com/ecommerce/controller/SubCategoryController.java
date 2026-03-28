package com.ecommerce.controller;

import com.ecommerce.dto.SubCategoryCreateDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.service.SubCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    @GetMapping
    public ResponseEntity<List<SubCategoryDTO>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryService.getAllSubCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> getSubCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(subCategoryService.getSubCategoryById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SubCategoryDTO>> getSubCategoriesByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(subCategoryService.getSubCategoriesByCategoryId(categoryId));
    }

    @PostMapping
    public ResponseEntity<SubCategoryDTO> createSubCategory(
            @Valid @RequestBody SubCategoryCreateDTO dto) {
        return new ResponseEntity<>(subCategoryService.createSubCategory(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> updateSubCategory(
            @PathVariable Long id,
            @Valid @RequestBody SubCategoryCreateDTO dto) {
        return ResponseEntity.ok(subCategoryService.updateSubCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable Long id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.noContent().build();
    }
}