package com.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderEmailData(
        Long orderId,
        LocalDateTime orderDate,
        String orderStatus,
        BigDecimal totalAmount,
        String customerName,
        String customerEmail,
        String customerPhone,
        String paymentMethod,
        List<OrderItemDTO> items
) {}