package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private String categoryName;
    private BigDecimal unitPrice;
    private BigDecimal sellingPrice;
    private BigDecimal discountPrice;
    private BigDecimal discount;
    private Integer quantity;
    private BigDecimal subtotal;
    private String color;
    private String size;
}