package com.ecommerce.dto;

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
public class ProductUpdateDTO {

    private String productName;
    private String productDescription;
    private String sku;

    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private BigDecimal unitPrice;
    private BigDecimal sellingPrice;
    private BigDecimal margin;

    private Long categoryId;
    private Long subCategoryId;
    private Boolean isActive;

    private String imageUrl;
    private List<String> imageUrls;
    private List<ProductVariantDTO> variants;
    private BigDecimal discount;
    private BigDecimal discountPrice;
    private Integer reorderLevel;
    private String unitOfMeasure;
}