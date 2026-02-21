package com.ecommerce.service.impl;

import com.ecommerce.entity.Order;
import com.ecommerce.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsServiceImpl implements SmsService {

    private final RestTemplate restTemplate;

    @Value("${sms.api.url:https://app.notify.lk/api/v1/send}")
    private String smsApiUrl;

    @Value("${sms.api.key:your-api-key}")
    private String smsApiKey;

    @Value("${sms.sender.id:NotifyDEMO}")
    private String senderId;

    @Value("${app.name:Clothify}")
    private String appName;

    @Override
    @Async
    public void sendOrderConfirmationSms(Order order, String phoneNumber) {
        try {
            String message = String.format(
                    "%s: Order #%d confirmed! Total: Rs %.2f. Payment: %s. Thank you for shopping with us!",
                    appName,
                    order.getOrderId(),
                    order.getTotalAmount(),
                    order.getPayment().getPaymentMethod()
            );

            sendSms(phoneNumber, message);
            log.info("Order confirmation SMS sent to: {}", phoneNumber);
        } catch (Exception e) {
            log.error("Failed to send order confirmation SMS", e);
        }
    }

    @Override
    @Async
    public void sendOrderStatusUpdateSms(Order order, String phoneNumber, String status) {
        try {
            String message = String.format(
                    "%s: Order #%d status updated to %s. Total: Rs %.2f",
                    appName,
                    order.getOrderId(),
                    status,
                    order.getTotalAmount()
            );

            sendSms(phoneNumber, message);
            log.info("Status update SMS sent to: {}", phoneNumber);
        } catch (Exception e) {
            log.error("Failed to send status update SMS", e);
        }
    }

    private void sendSms(String phoneNumber, String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + smsApiKey);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("user_id", senderId);
            requestBody.put("api_key", smsApiKey);
            requestBody.put("sender_id", senderId);
            requestBody.put("to", formatPhoneNumber(phoneNumber));
            requestBody.put("message", message);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    smsApiUrl,
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("SMS sent successfully to: {}", phoneNumber);
            } else {
                log.error("SMS sending failed. Status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error sending SMS", e);
        }
    }

    private String formatPhoneNumber(String phone) {
        // Remove any non-numeric characters
        String cleaned = phone.replaceAll("[^0-9]", "");

        // Add Sri Lanka country code if not present
        if (!cleaned.startsWith("94")) {
            if (cleaned.startsWith("0")) {
                cleaned = "94" + cleaned.substring(1);
            } else {
                cleaned = "94" + cleaned;
            }
        }

        return cleaned;
    }
}