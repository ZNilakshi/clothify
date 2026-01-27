package com.ecommerce.controller;

import com.ecommerce.dto.CheckoutDTO;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders/checkout - Create order from cart
    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> checkout(@Valid @RequestBody CheckoutDTO checkoutDTO) {
        log.info("POST /api/orders/checkout - Customer: {}", checkoutDTO.getCustomerId());
        OrderDTO order = orderService.checkout(checkoutDTO);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    // GET /api/orders/{id} - Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        log.info("GET /api/orders/{}", id);
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    // GET /api/orders/customer/{customerId} - Get customer orders
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable Long customerId) {
        log.info("GET /api/orders/customer/{}", customerId);
        List<OrderDTO> orders = orderService.getCustomerOrders(customerId);
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders - Get all orders
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        log.info("GET /api/orders - Fetching all orders");
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // PATCH /api/orders/{id}/status - Update order status
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        log.info("PATCH /api/orders/{}/status - New status: {}", id, status);
        OrderDTO order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }

    // POST /api/orders/{id}/cancel - Cancel order
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id) {
        log.info("POST /api/orders/{}/cancel", id);
        OrderDTO order = orderService.cancelOrder(id);
        return ResponseEntity.ok(order);
    }

    // POST /api/orders/{id}/payment - Process payment
    @PostMapping("/{id}/payment")
    public ResponseEntity<OrderDTO> processPayment(@PathVariable Long id) {
        log.info("POST /api/orders/{}/payment", id);
        OrderDTO order = orderService.processPayment(id);
        return ResponseEntity.ok(order);
    }
}