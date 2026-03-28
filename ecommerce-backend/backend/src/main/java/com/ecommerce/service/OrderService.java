package com.ecommerce.service;

import com.ecommerce.dto.CheckoutDTO;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.TrackingDTO;

import java.util.List;

public interface OrderService {
    OrderDTO checkout(CheckoutDTO checkoutDTO);
    OrderDTO getOrderById(Long orderId);
    List<OrderDTO> getCustomerOrders(Long customerId);
    List<OrderDTO> getAllOrders();
    OrderDTO updateOrderStatus(Long orderId, String status);
    OrderDTO addTrackingDetails(Long orderId, TrackingDTO trackingDTO);
    OrderDTO cancelOrder(Long orderId);
    OrderDTO processPayment(Long orderId);
}