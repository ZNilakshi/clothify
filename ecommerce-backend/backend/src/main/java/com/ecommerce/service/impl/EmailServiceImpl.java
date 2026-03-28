package com.ecommerce.service.impl;

import com.ecommerce.dto.OrderEmailData;
import com.ecommerce.dto.OrderItemDTO;
import com.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.admin}")
    private String adminEmail;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.name:Clothify}")
    private String appName;

    @Override
    @Async
    public void sendOrderConfirmationToCustomer(OrderEmailData emailData) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(emailData.customerEmail());
            helper.setSubject("Order Confirmation - Order #" + emailData.orderId());
            helper.setText(buildCustomerEmailContent(emailData), true);
            mailSender.send(message);
            log.info("Order confirmation email sent to: {}", emailData.customerEmail());
        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email", e);
        }
    }

    @Override
    @Async
    public void sendOrderNotificationToAdmin(OrderEmailData emailData) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("New Order Received - Order #" + emailData.orderId());
            helper.setText(buildAdminEmailContent(emailData), true);
            mailSender.send(message);
            log.info("Order notification email sent to admin: {}", adminEmail);
        } catch (MessagingException e) {
            log.error("Failed to send admin notification email", e);
        }
    }

    @Override
    @Async
    public void sendOrderStatusUpdate(String customerEmail, String customerName,
                                      Long orderId, String oldStatus, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Order Status Updated - Order #" + orderId);
            helper.setText(buildStatusUpdateEmailContent(customerName, orderId, oldStatus, newStatus), true);
            mailSender.send(message);
            log.info("Status update email sent to: {}", customerEmail);
        } catch (MessagingException e) {
            log.error("Failed to send status update email", e);
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String email, String customerName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Welcome to " + appName + "!");
            helper.setText(buildWelcomeEmailContent(customerName), true);
            mailSender.send(message);
            log.info("Welcome email sent to: {}", email);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email", e);
        }
    }

    // ── HTML builders ─────────────────────────────────────────────────────────

    private String buildCustomerEmailContent(OrderEmailData d) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif;line-height:1.6;color:#333}");
        html.append(".container{max-width:600px;margin:0 auto;padding:20px}");
        html.append(".header{background:#000;color:#fff;padding:20px;text-align:center}");
        html.append(".content{padding:20px;background:#f9f9f9}");
        html.append(".order-details{background:#fff;padding:15px;margin:15px 0;border-radius:5px}");
        html.append(".item-row{border-bottom:1px solid #eee;padding:10px 0}");
        html.append(".total-row{font-size:18px;font-weight:bold;padding:15px 0}");
        html.append(".footer{text-align:center;padding:20px;color:#666;font-size:12px}");
        html.append("</style></head><body><div class='container'>");
        html.append("<div class='header'><h1>").append(appName).append("</h1><h2>Order Confirmation</h2></div>");
        html.append("<div class='content'>");
        html.append("<p>Dear ").append(d.customerName()).append(",</p>");
        html.append("<p>Thank you for your order! We've received it and it's being processed.</p>");
        html.append("<div class='order-details'>");
        html.append("<h3>Order Details</h3>");
        html.append("<p><strong>Order Number:</strong> #").append(d.orderId()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(d.orderDate().format(fmt)).append("</p>");
        html.append("<p><strong>Status:</strong> ").append(d.orderStatus()).append("</p>");
        html.append("<h4>Items Ordered:</h4>");
        for (OrderItemDTO item : d.items()) {
            html.append("<div class='item-row'>");
            html.append("<strong>").append(item.getProductName()).append("</strong><br>");
            html.append("Quantity: ").append(item.getQuantity());
            html.append(" x Rs ").append(item.getUnitPrice());
            html.append(" = Rs ").append(item.getLineTotal());
            html.append("</div>");
        }
        html.append("<div class='total-row'>Total: Rs ").append(d.totalAmount()).append("</div>");
        html.append("<p><strong>Payment Method:</strong> ").append(d.paymentMethod()).append("</p>");
        html.append("</div>");
        html.append("<p>We'll send you another email when your order ships.</p>");
        html.append("</div>");
        html.append("<div class='footer'><p>&copy; 2024 ").append(appName).append(". All rights reserved.</p></div>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String buildAdminEmailContent(OrderEmailData d) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif}");
        html.append(".container{max-width:600px;margin:0 auto;padding:20px}");
        html.append(".alert{background:#d32f2f;color:#fff;padding:15px;border-radius:5px}");
        html.append(".details{background:#f5f5f5;padding:15px;margin:15px 0}");
        html.append("</style></head><body><div class='container'>");
        html.append("<div class='alert'><h2>New Order Received!</h2></div>");
        html.append("<div class='details'>");
        html.append("<h3>Order #").append(d.orderId()).append("</h3>");
        html.append("<p><strong>Customer:</strong> ").append(d.customerName()).append("</p>");
        html.append("<p><strong>Email:</strong> ").append(d.customerEmail()).append("</p>");
        html.append("<p><strong>Phone:</strong> ").append(d.customerPhone()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(d.orderDate().format(fmt)).append("</p>");
        html.append("<p><strong>Total Amount:</strong> Rs ").append(d.totalAmount()).append("</p>");
        html.append("<p><strong>Payment Method:</strong> ").append(d.paymentMethod()).append("</p>");
        html.append("<h4>Items:</h4>");
        for (OrderItemDTO item : d.items()) {
            html.append("<p>- ").append(item.getProductName());
            html.append(" (Qty: ").append(item.getQuantity()).append(")");
            html.append(" - Rs ").append(item.getLineTotal()).append("</p>");
        }
        html.append("</div>");
        html.append("<p><a href='http://localhost:3000/admin/orders/").append(d.orderId());
        html.append("' style='background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;'>View Order</a></p>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String buildStatusUpdateEmailContent(String customerName, Long orderId,
                                                 String oldStatus, String newStatus) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif}");
        html.append(".container{max-width:600px;margin:0 auto;padding:20px}");
        html.append(".status-update{background:#4caf50;color:#fff;padding:20px;text-align:center}");
        html.append("</style></head><body><div class='container'>");
        html.append("<div class='status-update'><h2>Order Status Updated</h2></div>");
        html.append("<p>Dear ").append(customerName).append(",</p>");
        html.append("<p>Your order #").append(orderId).append(" status has been updated:</p>");
        html.append("<p><strong>").append(oldStatus).append("</strong> &rarr; <strong>").append(newStatus).append("</strong></p>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String buildWelcomeEmailContent(String customerName) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif;line-height:1.6;color:#333}");
        html.append(".container{max-width:600px;margin:0 auto;padding:20px}");
        html.append(".header{background:#000;color:#fff;padding:30px 20px;text-align:center}");
        html.append(".content{padding:30px 20px;background:#f9f9f9}");
        html.append(".btn{display:inline-block;padding:12px 30px;background:#000;color:#fff;text-decoration:none;border-radius:5px;margin:20px 0}");
        html.append(".footer{text-align:center;padding:20px;color:#666;font-size:12px}");
        html.append("</style></head><body><div class='container'>");
        html.append("<div class='header'><h1>").append(appName).append("</h1><h2>Welcome Aboard!</h2></div>");
        html.append("<div class='content'>");
        html.append("<h2>Hello ").append(customerName).append("!</h2>");
        html.append("<p>Thank you for joining <strong>").append(appName).append("</strong>! We're thrilled to have you.</p>");
        html.append("<ul><li>Browse our latest collection</li><li>Get exclusive deals and discounts</li>");
        html.append("<li>Track your orders easily</li><li>Save your favorite items</li></ul>");
        html.append("<div style='text-align:center;'><a href='http://localhost:3000' class='btn'>Start Shopping</a></div>");
        html.append("<p>Happy Shopping!<br>The ").append(appName).append(" Team</p>");
        html.append("</div>");
        html.append("<div class='footer'><p>&copy; 2024 ").append(appName).append(". All rights reserved.</p></div>");
        html.append("</div></body></html>");
        return html.toString();
    }
}