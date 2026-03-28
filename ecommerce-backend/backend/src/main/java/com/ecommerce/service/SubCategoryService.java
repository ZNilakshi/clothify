package com.ecommerce.service;

import com.ecommerce.dto.SubCategoryCreateDTO;
import com.ecommerce.dto.SubCategoryDTO;

import java.util.List;

public interface SubCategoryService {
    SubCategoryDTO createSubCategory(SubCategoryCreateDTO dto);
    SubCategoryDTO getSubCategoryById(Long id);
    List<SubCategoryDTO> getAllSubCategories();
    List<SubCategoryDTO> getSubCategoriesByCategoryId(Long categoryId);
    SubCategoryDTO updateSubCategory(Long id, SubCategoryCreateDTO dto);
    void deleteSubCategory(Long id);
}