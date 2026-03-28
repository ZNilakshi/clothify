package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateDTO {

    @NotBlank(message = "Product name is required")
    private String productName;

    private String productDescription;
    private String sku;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private BigDecimal unitPrice;
    private BigDecimal sellingPrice;
    private BigDecimal margin;
    private BigDecimal discount;
    private BigDecimal discountPrice;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Long subCategoryId;

    private Integer initialStock;
    private Integer reorderLevel;
    private String unitOfMeasure;

    private String imageUrl;
    private List<String> imageUrls;
    private List<ProductVariantDTO> variants;
}