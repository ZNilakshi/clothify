package com.ecommerce.service.impl;

import com.ecommerce.dto.CheckoutDTO;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.OrderMapper;
import com.ecommerce.repository.*;
import com.ecommerce.service.OrderService;
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

    @Override
    public OrderDTO checkout(CheckoutDTO checkoutDTO) {
        log.info("Processing checkout for customer: {}", checkoutDTO.getCustomerId());

        // 1. Validate customer exists
        Customer customer = customerRepository.findById(checkoutDTO.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", checkoutDTO.getCustomerId()));

        // 2. Get customer's cart
        Cart cart = cartRepository.findByCustomerCustomerId(checkoutDTO.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", checkoutDTO.getCustomerId()));

        // 3. Validate cart is not empty
        if (cart.getCartItems().isEmpty()) {
            throw new BusinessException("Cannot checkout with empty cart");
        }

        // 4. Validate city exists (optional)
        City city = null;
        if (checkoutDTO.getCityId() != null) {
            city = cityRepository.findById(checkoutDTO.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City", "id", checkoutDTO.getCityId()));
        }

        // 5. Validate stock availability and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        Set<OrderItem> orderItems = new HashSet<>();

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            Inventory inventory = product.getInventory();

            // Check stock
            if (inventory == null || inventory.getQuantityInStock() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        product.getProductName(),
                        cartItem.getQuantity(),
                        inventory != null ? inventory.getQuantityInStock() : 0
                );
            }

            // Calculate line total
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            // Create order item (will be linked to order later)
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .lineTotal(lineTotal)
                    .build();

            orderItems.add(orderItem);
        }

        // 6. Create order
        Order order = Order.builder()
                .customer(customer)
                .city(city)
                .orderDate(LocalDateTime.now())
                .orderStatus("PENDING")
                .totalAmount(totalAmount)
                .orderItems(orderItems)
                .build();

        // Link order items to order (bidirectional)
        orderItems.forEach(item -> item.setOrder(order));

        // 7. Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(checkoutDTO.getPaymentMethod())
                .paymentStatus("PENDING")
                .build();

        order.setPayment(payment);

        // 8. Create sale transaction
        Sale sale = Sale.builder()
                .order(order)
                .transactionDate(LocalDateTime.now())
                .build();

        order.setSale(sale);

        // 9. Reduce inventory
        for (CartItem cartItem : cart.getCartItems()) {
            Inventory inventory = cartItem.getProduct().getInventory();
            inventory.setQuantityInStock(inventory.getQuantityInStock() - cartItem.getQuantity());
            inventoryRepository.save(inventory);
        }

        // 10. Save order (cascades to order items, payment, and sale)
        Order savedOrder = orderRepository.save(order);

        // 11. Clear cart
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
        // Validate customer exists
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
        log.info("Updating order {} status to: {}", orderId, status);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Validate status transition
        validateStatusTransition(order.getOrderStatus(), status);

        order.setOrderStatus(status);

        // If order is completed, mark payment as completed
        if ("COMPLETED".equals(status) && order.getPayment() != null) {
            order.getPayment().setPaymentStatus("COMPLETED");
            order.getPayment().setPaymentDate(LocalDateTime.now());
        }

        Order updated = orderRepository.save(order);
        return orderMapper.toDTO(updated);
    }

    @Override
    public OrderDTO cancelOrder(Long orderId) {
        log.info("Cancelling order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Can only cancel pending or processing orders
        if ("COMPLETED".equals(order.getOrderStatus()) || "CANCELLED".equals(order.getOrderStatus())) {
            throw new BusinessException("Cannot cancel order with status: " + order.getOrderStatus());
        }

        // Restore inventory
        for (OrderItem item : order.getOrderItems()) {
            Inventory inventory = item.getProduct().getInventory();
            inventory.setQuantityInStock(inventory.getQuantityInStock() + item.getQuantity());
            inventoryRepository.save(inventory);
        }

        order.setOrderStatus("CANCELLED");

        if (order.getPayment() != null) {
            order.getPayment().setPaymentStatus("REFUNDED");
        }

        Order cancelled = orderRepository.save(order);
        return orderMapper.toDTO(cancelled);
    }

    @Override
    public OrderDTO processPayment(Long orderId) {
        log.info("Processing payment for order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getPayment() == null) {
            throw new BusinessException("No payment record found for order");
        }

        // Simulate payment processing
        Payment payment = order.getPayment();
        payment.setPaymentStatus("COMPLETED");
        payment.setPaymentDate(LocalDateTime.now());

        order.setOrderStatus("PROCESSING");

        Order updated = orderRepository.save(order);
        return orderMapper.toDTO(updated);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Define valid transitions
        if ("CANCELLED".equals(currentStatus)) {
            throw new BusinessException("Cannot change status of cancelled order");
        }

        if ("COMPLETED".equals(currentStatus)) {
            throw new BusinessException("Cannot change status of completed order");
        }

        // Add more business rules as needed
    }
}