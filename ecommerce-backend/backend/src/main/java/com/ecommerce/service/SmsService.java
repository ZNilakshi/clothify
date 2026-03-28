package com.ecommerce.service;

import java.math.BigDecimal;

public interface SmsService {
    void sendOrderConfirmationSms(Long orderId, String phoneNumber, BigDecimal totalAmount);
    void sendOrderStatusUpdateSms(Long orderId, String phoneNumber, String oldStatus, String newStatus);
}