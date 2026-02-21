package com.ecommerce.service;

import com.ecommerce.dto.AddToCartDTO;
import com.ecommerce.dto.CartDTO;

public interface CartService {
    CartDTO getCustomerCart(Long customerId);
    CartDTO addToCart(Long customerId, AddToCartDTO dto);
    CartDTO updateCartItemQuantity(Long customerId, Long cartItemId, Integer quantity);
    CartDTO removeFromCart(Long customerId, Long cartItemId);
    void clearCart(Long customerId);
}