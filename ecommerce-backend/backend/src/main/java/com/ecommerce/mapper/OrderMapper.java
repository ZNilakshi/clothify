package com.ecommerce.mapper;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderItemDTO;
import com.ecommerce.dto.PaymentDTO;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Customer;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Payment;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderDTO toDTO(Order order) {
        if (order == null) return null;

        Customer customer = order.getCustomer();

        return OrderDTO.builder()
                .orderId(order.getOrderId())
                .customerId(customer.getCustomerId())
                .customerName(customer.getCustomerName())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                // Fallback to customer fields if order fields are null
                .phone(order.getPhone() != null ? order.getPhone() : customer.getPhoneNumber())
                .email(order.getEmail() != null ? order.getEmail() : customer.getEmail())
                .deliveryMethod(order.getDeliveryMethod())
                .cityId(order.getCity() != null ? order.getCity().getCityId() : null)
                .cityName(order.getCity() != null ? order.getCity().getCityName() : null)
                .trackingNumber(order.getTrackingNumber())
                .carrier(order.getCarrier())
                .estimatedDelivery(order.getEstimatedDelivery())
                .trackingUrl(order.getTrackingUrl())
                .items(order.getOrderItems().stream()
                        .map(this::toOrderItemDTO)
                        .collect(Collectors.toList()))
                .payment(order.getPayment() != null ? toPaymentDTO(order.getPayment()) : null)
                .build();
    }

    private OrderItemDTO toOrderItemDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .orderItemId(item.getOrderItemId())
                .productId(item.getProduct().getProductId())
                .productName(item.getProduct().getProductName())
                .sku(item.getProduct().getSku())
                .imageUrl(item.getProduct().getImageUrl())
                .color(item.getSelectedColor())
                .size(item.getSelectedSize())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    private PaymentDTO toPaymentDTO(Payment payment) {
        return PaymentDTO.builder()
                .paymentId(payment.getPaymentId())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}