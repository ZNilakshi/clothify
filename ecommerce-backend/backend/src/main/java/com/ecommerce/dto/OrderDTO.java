package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private Long customerId;
    private String customerName;
    private LocalDateTime orderDate;
    private String orderStatus;
    private BigDecimal totalAmount;

    // Delivery info
    private String deliveryAddress;
    private String phone;
    private String email;
    private String deliveryMethod;
    private String cityName;
    private Long cityId;

    // Tracking info
    private String trackingNumber;
    private String carrier;
    private LocalDate estimatedDelivery;  // ← LocalDate (date only)
    private String trackingUrl;

    private List<OrderItemDTO> items;
    private PaymentDTO payment;
}