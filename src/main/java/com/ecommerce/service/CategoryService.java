package com.ecommerce.service;

import com.ecommerce.dto.CategoryCreateDTO;
import com.ecommerce.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {
    CategoryDTO createCategory(CategoryCreateDTO dto);
    CategoryDTO getCategoryById(Long id);
    List<CategoryDTO> getAllCategories();
    CategoryDTO updateCategory(Long id, CategoryCreateDTO dto);
    void deleteCategory(Long id);
}
