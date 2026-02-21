package com.ecommerce.service;

import com.ecommerce.entity.Order;

public interface EmailService {
    void sendOrderConfirmationToCustomer(Order order, String customerEmail);
    void sendOrderNotificationToAdmin(Order order);
    void sendOrderStatusUpdate(Order order, String oldStatus, String newStatus);
    void sendWelcomeEmail(String email, String customerName);  // ← Add this
}