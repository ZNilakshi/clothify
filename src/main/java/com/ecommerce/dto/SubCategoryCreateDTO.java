package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryCreateDTO {

    @NotBlank(message = "Sub category name is required")
    private String subCategoryName;

    private String subCategoryDescription;
    private String imageUrl;
    @NotNull(message = "Category ID is required")
    private Long categoryId;
}