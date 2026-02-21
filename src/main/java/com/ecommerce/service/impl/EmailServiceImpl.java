package com.ecommerce.service.impl;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
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
    public void sendOrderConfirmationToCustomer(Order order, String customerEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Order Confirmation - Order #" + order.getOrderId());
            helper.setText(buildCustomerEmailContent(order), true);

            mailSender.send(message);
            log.info("Order confirmation email sent to: {}", customerEmail);
        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email", e);
        }
    }

    @Override
    @Async
    public void sendOrderNotificationToAdmin(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("New Order Received - Order #" + order.getOrderId());
            helper.setText(buildAdminEmailContent(order), true);

            mailSender.send(message);
            log.info("Order notification email sent to admin: {}", adminEmail);
        } catch (MessagingException e) {
            log.error("Failed to send admin notification email", e);
        }
    }

    @Override
    @Async
    public void sendOrderStatusUpdate(Order order, String oldStatus, String newStatus) {
        try {
            String customerEmail = order.getCustomer().getEmail();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Order Status Updated - Order #" + order.getOrderId());
            helper.setText(buildStatusUpdateEmailContent(order, oldStatus, newStatus), true);

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

    private String buildWelcomeEmailContent(String customerName) {
        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>");
        html.append("<html><head><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }");
        html.append(".content { padding: 30px 20px; background: #f9f9f9; }");
        html.append(".btn { display: inline-block; padding: 12px 30px; background: #000; color: #fff; ");
        html.append("text-decoration: none; border-radius: 5px; margin: 20px 0; }");
        html.append(".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>").append(appName).append("</h1>");
        html.append("<h2>Welcome Aboard!</h2>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<h2>Hello ").append(customerName).append("! 👋</h2>");
        html.append("<p>Thank you for joining <strong>").append(appName).append("</strong>! ");
        html.append("We're thrilled to have you as part of our community.</p>");

        html.append("<p>Here's what you can do now:</p>");
        html.append("<ul>");
        html.append("<li>Browse our latest collection</li>");
        html.append("<li>Get exclusive deals and discounts</li>");
        html.append("<li>Track your orders easily</li>");
        html.append("<li>Save your favorite items</li>");
        html.append("</ul>");

        html.append("<div style='text-align: center;'>");
        html.append("<a href='http://localhost:3000' class='btn'>Start Shopping</a>");
        html.append("</div>");

        html.append("<p>If you have any questions, feel free to reach out to us anytime.</p>");
        html.append("<p>Happy Shopping!<br>");
        html.append("The ").append(appName).append(" Team</p>");
        html.append("</div>");

        html.append("<div class='footer'>");
        html.append("<p>&copy; 2024 ").append(appName).append(". All rights reserved.</p>");
        html.append("<p>You received this email because you created an account at ").append(appName).append("</p>");
        html.append("</div>");
        html.append("</div></body></html>");

        return html.toString();
    }

    private String buildCustomerEmailContent(Order order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>");
        html.append("<html><head><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background: #000; color: #fff; padding: 20px; text-align: center; }");
        html.append(".content { padding: 20px; background: #f9f9f9; }");
        html.append(".order-details { background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; }");
        html.append(".item-row { border-bottom: 1px solid #eee; padding: 10px 0; }");
        html.append(".total-row { font-size: 18px; font-weight: bold; padding: 15px 0; }");
        html.append(".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>").append(appName).append("</h1>");
        html.append("<h2>Order Confirmation</h2>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<p>Dear ").append(order.getCustomer().getCustomerName()).append(",</p>");
        html.append("<p>Thank you for your order! We're happy to confirm that we've received your order.</p>");

        html.append("<div class='order-details'>");
        html.append("<h3>Order Details</h3>");
        html.append("<p><strong>Order Number:</strong> #").append(order.getOrderId()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(order.getOrderDate().format(formatter)).append("</p>");
        html.append("<p><strong>Status:</strong> ").append(order.getOrderStatus()).append("</p>");

        html.append("<h4>Items Ordered:</h4>");
        for (OrderItem item : order.getOrderItems()) {
            html.append("<div class='item-row'>");
            html.append("<strong>").append(item.getProduct().getProductName()).append("</strong><br>");
            html.append("Quantity: ").append(item.getQuantity());
            html.append(" × Rs ").append(item.getUnitPrice());
            html.append(" = Rs ").append(item.getLineTotal());
            html.append("</div>");
        }

        html.append("<div class='total-row'>");
        html.append("Total: Rs ").append(order.getTotalAmount());
        html.append("</div>");

        html.append("<p><strong>Payment Method:</strong> ").append(order.getPayment().getPaymentMethod()).append("</p>");
        html.append("</div>");

        html.append("<p>We'll send you another email when your order ships.</p>");
        html.append("<p>If you have any questions, please contact us.</p>");
        html.append("</div>");

        html.append("<div class='footer'>");
        html.append("<p>&copy; 2024 ").append(appName).append(". All rights reserved.</p>");
        html.append("</div>");
        html.append("</div></body></html>");

        return html.toString();
    }

    private String buildAdminEmailContent(Order order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>");
        html.append("<html><head><style>");
        html.append("body { font-family: Arial, sans-serif; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".alert { background: #d32f2f; color: #fff; padding: 15px; border-radius: 5px; }");
        html.append(".details { background: #f5f5f5; padding: 15px; margin: 15px 0; }");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='alert'>");
        html.append("<h2>🔔 New Order Received!</h2>");
        html.append("</div>");

        html.append("<div class='details'>");
        html.append("<h3>Order #").append(order.getOrderId()).append("</h3>");
        html.append("<p><strong>Customer:</strong> ").append(order.getCustomer().getCustomerName()).append("</p>");
        html.append("<p><strong>Email:</strong> ").append(order.getCustomer().getEmail()).append("</p>");
        html.append("<p><strong>Phone:</strong> ").append(order.getCustomer().getPhoneNumber()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(order.getOrderDate().format(formatter)).append("</p>");
        html.append("<p><strong>Total Amount:</strong> Rs ").append(order.getTotalAmount()).append("</p>");
        html.append("<p><strong>Payment Method:</strong> ").append(order.getPayment().getPaymentMethod()).append("</p>");

        html.append("<h4>Items:</h4>");
        for (OrderItem item : order.getOrderItems()) {
            html.append("<p>• ").append(item.getProduct().getProductName());
            html.append(" (Qty: ").append(item.getQuantity()).append(")");
            html.append(" - Rs ").append(item.getLineTotal()).append("</p>");
        }
        html.append("</div>");

        html.append("<p><a href='http://localhost:3000/admin/orders/").append(order.getOrderId());
        html.append("' style='background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;'>View Order</a></p>");

        html.append("</div></body></html>");

        return html.toString();
    }

    private String buildStatusUpdateEmailContent(Order order, String oldStatus, String newStatus) {
        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>");
        html.append("<html><head><style>");
        html.append("body { font-family: Arial, sans-serif; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".status-update { background: #4caf50; color: #fff; padding: 20px; text-align: center; }");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='status-update'>");
        html.append("<h2>Order Status Updated</h2>");
        html.append("</div>");

        html.append("<p>Dear ").append(order.getCustomer().getCustomerName()).append(",</p>");
        html.append("<p>Your order #").append(order.getOrderId()).append(" status has been updated:</p>");
        html.append("<p><strong>").append(oldStatus).append("</strong> → <strong>").append(newStatus).append("</strong></p>");
        html.append("<p>Total Amount: Rs ").append(order.getTotalAmount()).append("</p>");

        html.append("</div></body></html>");

        return html.toString();
    }
}