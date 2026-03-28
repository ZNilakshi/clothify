package com.ecommerce.service.impl;

import com.ecommerce.dto.CheckoutDTO;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderEmailData;
import com.ecommerce.dto.OrderItemDTO;
import com.ecommerce.dto.TrackingDTO;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.OrderMapper;
import com.ecommerce.repository.*;
import com.ecommerce.service.EmailService;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final CartRepository cartRepository;
    private final CityRepository cityRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderMapper orderMapper;
    private final EmailService emailService;
    private final SmsService smsService;

    // ── Helper: build the flat email DTO while the Hibernate session is open ──
    private OrderEmailData toEmailData(Order order) {
        List<OrderItemDTO> items = order.getOrderItems().stream()
                .map(i -> OrderItemDTO.builder()
                        .productName(i.getProduct().getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .lineTotal(i.getLineTotal())
                        .build())
                .collect(Collectors.toList());

        return new OrderEmailData(
                order.getOrderId(),
                order.getOrderDate(),
                order.getOrderStatus(),
                order.getTotalAmount(),
                order.getCustomer().getCustomerName(),
                order.getCustomer().getEmail(),
                order.getCustomer().getPhoneNumber(),
                order.getPayment() != null ? order.getPayment().getPaymentMethod() : "N/A",
                items
        );
    }

    @Override
    public OrderDTO checkout(CheckoutDTO checkoutDTO) {
        log.info("Processing checkout for customer: {}", checkoutDTO.getCustomerId());

        Customer customer = customerRepository.findById(checkoutDTO.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", checkoutDTO.getCustomerId()));

        Cart cart = cartRepository.findByCustomerCustomerId(checkoutDTO.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", checkoutDTO.getCustomerId()));

        if (cart.getCartItems().isEmpty()) {
            throw new BusinessException("Cannot checkout with empty cart");
        }

        City city = null;
        if (checkoutDTO.getCityId() != null) {
            city = cityRepository.findById(checkoutDTO.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City", "id", checkoutDTO.getCityId()));
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        Set<OrderItem> orderItems = new HashSet<>();

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            Inventory inventory = product.getInventory();

            if (inventory == null || inventory.getQuantityInStock() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        product.getProductName(),
                        cartItem.getQuantity(),
                        inventory != null ? inventory.getQuantityInStock() : 0
                );
            }

            BigDecimal unitPrice = product.getDiscountPrice() != null
                    && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                    ? product.getDiscountPrice()
                    : product.getSellingPrice();

            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .selectedColor(cartItem.getSelectedColor())
                    .selectedSize(cartItem.getSelectedSize())
                    .build();

            orderItems.add(orderItem);
        }

        if ("delivery".equalsIgnoreCase(checkoutDTO.getDeliveryMethod())) {
            totalAmount = totalAmount.add(new BigDecimal("350.00"));
        }

        Order order = Order.builder()
                .customer(customer)
                .city(city)
                .orderDate(LocalDateTime.now())
                .orderStatus("PENDING")
                .totalAmount(totalAmount)
                .orderItems(orderItems)
                .phone(checkoutDTO.getPhone())
                .email(checkoutDTO.getEmail())
                .deliveryMethod(checkoutDTO.getDeliveryMethod())
                .deliveryAddress(buildDeliveryAddress(checkoutDTO))
                .build();

        orderItems.forEach(item -> item.setOrder(order));

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(checkoutDTO.getPaymentMethod())
                .paymentStatus("PENDING")
                .build();
        order.setPayment(payment);

        Sale sale = Sale.builder()
                .order(order)
                .transactionDate(LocalDateTime.now())
                .build();
        order.setSale(sale);

        for (CartItem cartItem : cart.getCartItems()) {
            Inventory inventory = cartItem.getProduct().getInventory();
            inventory.setQuantityInStock(inventory.getQuantityInStock() - cartItem.getQuantity());
            inventoryRepository.save(inventory);
        }

        Order savedOrder = orderRepository.save(order);

        try {
            OrderEmailData emailData = toEmailData(savedOrder);
            emailService.sendOrderConfirmationToCustomer(emailData);
            emailService.sendOrderNotificationToAdmin(emailData);
            smsService.sendOrderConfirmationSms(
                    savedOrder.getOrderId(),
                    checkoutDTO.getPhone(),
                    savedOrder.getTotalAmount()
            );
            log.info("All notifications dispatched for order: {}", savedOrder.getOrderId());
        } catch (Exception e) {
            log.error("Error dispatching notifications for order: {}", savedOrder.getOrderId(), e);
        }

        cart.getCartItems().clear();
        cartRepository.save(cart);

        log.info("Order created successfully: {}", savedOrder.getOrderId());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return orderMapper.toDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getCustomerOrders(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer", "id", customerId);
        }
        return orderRepository.findByCustomerCustomerId(customerId).stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        log.info("Updating order {} status to {}", orderId, status);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateStatusTransition(order.getOrderStatus(), status);

        String oldStatus = order.getOrderStatus();
        order.setOrderStatus(status);

        if ("COMPLETED".equals(status) && order.getPayment() != null) {
            order.getPayment().setPaymentStatus("COMPLETED");
            order.getPayment().setPaymentDate(LocalDateTime.now());
        }

        Order updated = orderRepository.save(order);

        try {
            String customerEmail = updated.getCustomer().getEmail();
            String customerName  = updated.getCustomer().getCustomerName();
            String customerPhone = updated.getCustomer().getPhoneNumber();
            emailService.sendOrderStatusUpdate(customerEmail, customerName, orderId, oldStatus, status);
            smsService.sendOrderStatusUpdateSms(orderId, customerPhone, oldStatus, status);
        } catch (Exception e) {
            log.error("Error sending status update notifications for order: {}", orderId, e);
        }

        return orderMapper.toDTO(updated);
    }

    @Override
    public OrderDTO cancelOrder(Long orderId) {
        log.info("Cancelling order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if ("COMPLETED".equals(order.getOrderStatus()) || "CANCELLED".equals(order.getOrderStatus())) {
            throw new BusinessException("Cannot cancel order with status: " + order.getOrderStatus());
        }

        for (OrderItem item : order.getOrderItems()) {
            Inventory inventory = item.getProduct().getInventory();
            inventory.setQuantityInStock(inventory.getQuantityInStock() + item.getQuantity());
            inventoryRepository.save(inventory);
        }

        order.setOrderStatus("CANCELLED");
        if (order.getPayment() != null) {
            order.getPayment().setPaymentStatus("REFUNDED");
        }

        return orderMapper.toDTO(orderRepository.save(order));
    }

    @Override
    public OrderDTO processPayment(Long orderId) {
        log.info("Processing payment for order {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getPayment() == null) {
            throw new BusinessException("No payment record found for order");
        }

        order.getPayment().setPaymentStatus("COMPLETED");
        order.getPayment().setPaymentDate(LocalDateTime.now());
        order.setOrderStatus("PROCESSING");

        return orderMapper.toDTO(orderRepository.save(order));
    }

    @Override
    public OrderDTO addTrackingDetails(Long orderId, TrackingDTO trackingDTO) {
        log.info("Adding tracking details to order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        String oldStatus = order.getOrderStatus();

        order.setTrackingNumber(trackingDTO.getTrackingNumber());
        order.setCarrier(trackingDTO.getCarrier());
        order.setEstimatedDelivery(trackingDTO.getEstimatedDelivery());
        order.setTrackingUrl(trackingDTO.getTrackingUrl());

        if ("PENDING".equals(oldStatus) || "PROCESSING".equals(oldStatus)) {
            order.setOrderStatus("SHIPPED");
        }

        Order updated = orderRepository.save(order);

        try {
            String customerEmail = updated.getCustomer().getEmail();
            String customerName  = updated.getCustomer().getCustomerName();
            String customerPhone = updated.getCustomer().getPhoneNumber();
            emailService.sendOrderStatusUpdate(customerEmail, customerName, orderId, oldStatus, "SHIPPED");
            smsService.sendOrderStatusUpdateSms(orderId, customerPhone, oldStatus, "SHIPPED");
        } catch (Exception e) {
            log.error("Error sending tracking notification for order: {}", orderId, e);
        }

        return orderMapper.toDTO(updated);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        if ("CANCELLED".equals(currentStatus)) {
            throw new BusinessException("Cannot change status of cancelled order");
        }
        if ("COMPLETED".equals(currentStatus)) {
            throw new BusinessException("Cannot change status of completed order");
        }
    }

    private String buildDeliveryAddress(CheckoutDTO dto) {
        StringBuilder sb = new StringBuilder();
        if (dto.getStreet() != null)    sb.append(dto.getStreet());
        if (dto.getApartment() != null) sb.append(", ").append(dto.getApartment());
        if (dto.getCity() != null)      sb.append(", ").append(dto.getCity());
        if (dto.getPostal() != null)    sb.append(" ").append(dto.getPostal());
        return sb.toString().trim();
    }
}