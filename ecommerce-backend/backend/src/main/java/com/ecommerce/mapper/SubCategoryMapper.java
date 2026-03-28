package com.ecommerce.mapper;

import com.ecommerce.dto.SubCategoryCreateDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.SubCategory;
import org.springframework.stereotype.Component;

@Component
public class SubCategoryMapper {

    public SubCategoryDTO toDTO(SubCategory subCategory) {
        if (subCategory == null) return null;

        return SubCategoryDTO.builder()
                .subCategoryId(subCategory.getSubCategoryId())
                .subCategoryName(subCategory.getSubCategoryName())
                .subCategoryDescription(subCategory.getSubCategoryDescription())
                .categoryId(subCategory.getCategory() != null ?
                        subCategory.getCategory().getCategoryId() : null)
                .categoryName(subCategory.getCategory() != null ?
                        subCategory.getCategory().getCategoryName() : null)
                .imageUrl(subCategory.getImageUrl())
                .createdAt(subCategory.getCreatedAt())
                .updatedAt(subCategory.getUpdatedAt())
                .build();
    }

    public SubCategory toEntity(SubCategoryCreateDTO dto, Category category) {
        if (dto == null) return null;

        return SubCategory.builder()
                .subCategoryName(dto.getSubCategoryName())
                .subCategoryDescription(dto.getSubCategoryDescription())
                .imageUrl(dto.getImageUrl())
                .category(category)
                .build();
    }
}