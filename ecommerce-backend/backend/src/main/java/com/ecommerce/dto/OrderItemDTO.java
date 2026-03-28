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
public class OrderItemDTO {
    private Long orderItemId;
    private Long productId;
    private String productName;
    private String sku;
    private String imageUrl;
    private String color;
    private String size;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}