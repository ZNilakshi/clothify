package com.ecommerce.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateDTO {
    private String productName;
    private String productDescription;

    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private Long categoryId;
    private Boolean isActive;
}