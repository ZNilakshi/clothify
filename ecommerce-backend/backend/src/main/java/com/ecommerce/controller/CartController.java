package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartDTO;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<CartDTO> getCustomerCart(@PathVariable Long customerId) {
        return ResponseEntity.ok(cartService.getCustomerCart(customerId));
    }

    @PostMapping("/customer/{customerId}/add")
    public ResponseEntity<CartDTO> addToCart(
            @PathVariable Long customerId,
            @Valid @RequestBody AddToCartDTO dto) {
        return ResponseEntity.ok(cartService.addToCart(customerId, dto));
    }

    @PutMapping("/customer/{customerId}/item/{cartItemId}")
    public ResponseEntity<CartDTO> updateQuantity(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItemQuantity(customerId, cartItemId, quantity));
    }

    @DeleteMapping("/customer/{customerId}/item/{cartItemId}")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeFromCart(customerId, cartItemId));
    }

    @DeleteMapping("/customer/{customerId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
}
