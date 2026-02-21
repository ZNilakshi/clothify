package com.ecommerce.service;

import com.ecommerce.entity.Order;

public interface SmsService {
    void sendOrderConfirmationSms(Order order, String phoneNumber);
    void sendOrderStatusUpdateSms(Order order, String phoneNumber, String status);
}