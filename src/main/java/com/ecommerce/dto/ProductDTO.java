package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long productId;
    private String productName;
    private String productDescription;
    private String sku;
    private BigDecimal price;
    private BigDecimal unitPrice;
    private BigDecimal sellingPrice;
    private BigDecimal margin;
    private Boolean isActive;
    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;
    private Integer stockQuantity;
    private BigDecimal discount;
    private BigDecimal discountPrice;
    private String imageUrl;
    private List<String> imageUrls;
    private List<ProductVariantDTO> variants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}