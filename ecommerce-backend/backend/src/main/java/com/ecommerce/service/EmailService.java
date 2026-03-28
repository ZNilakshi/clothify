package com.ecommerce.service;

import com.ecommerce.dto.OrderEmailData;

public interface EmailService {
    void sendOrderConfirmationToCustomer(OrderEmailData emailData);
    void sendOrderNotificationToAdmin(OrderEmailData emailData);
    void sendOrderStatusUpdate(String customerEmail, String customerName,
                               Long orderId, String oldStatus, String newStatus);
    void sendWelcomeEmail(String email, String customerName);
}