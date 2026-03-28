package com.ecommerce.mapper;

import com.ecommerce.dto.CategoryCreateDTO;
import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category category) {
        if (category == null) return null;

        return CategoryDTO.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .categoryDescription(category.getCategoryDescription())
                .imageUrl(category.getImageUrl())
                .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public Category toEntity(CategoryCreateDTO dto) {
        if (dto == null) return null;

        return Category.builder()
                .categoryName(dto.getCategoryName())
                .categoryDescription(dto.getCategoryDescription())
                .imageUrl(dto.getImageUrl())
                .build();
    }
}
