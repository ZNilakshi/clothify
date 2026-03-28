package com.ecommerce.service.impl;

import com.ecommerce.dto.AddToCartDTO;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Customer;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.CartMapper;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.CustomerRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

    @Override
    @Transactional(readOnly = true)
    public CartDTO getCustomerCart(Long customerId) {
        Cart cart = cartRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId));
        return cartMapper.toDTO(cart);
    }

    @Override
    public CartDTO addToCart(Long customerId, AddToCartDTO dto) {
        Cart cart = cartRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", dto.getProductId()));

        // ✅ Validate against VARIANT stock, not total inventory
        int variantStock = getVariantStock(product, dto.getColor(), dto.getSize());
        if (variantStock < dto.getQuantity()) {
            throw new InsufficientStockException(product.getProductName(), dto.getQuantity(), variantStock);
        }

        // Match by productId + color + size
        CartItem existingItem = cart.getCartItems().stream()
                .filter(item ->
                        item.getProduct().getProductId().equals(dto.getProductId()) &&
                                java.util.Objects.equals(item.getSelectedColor(), dto.getColor()) &&
                                java.util.Objects.equals(item.getSelectedSize(), dto.getSize())
                )
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // ✅ Check combined quantity doesn't exceed variant stock
            int newQty = existingItem.getQuantity() + dto.getQuantity();
            if (newQty > variantStock) {
                throw new InsufficientStockException(product.getProductName(), newQty, variantStock);
            }
            existingItem.setQuantity(newQty);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(dto.getQuantity())
                    .selectedColor(dto.getColor())
                    .selectedSize(dto.getSize())
                    .build();
            cart.getCartItems().add(newItem);
        }

        return cartMapper.toDTO(cartRepository.save(cart));
    }

    @Override
    public CartDTO updateCartItemQuantity(Long customerId, Long cartItemId, Integer quantity) {
        Cart cart = cartRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId));

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getCartItemId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        // ✅ Validate against VARIANT stock, not total inventory
        int variantStock = getVariantStock(
                cartItem.getProduct(),
                cartItem.getSelectedColor(),
                cartItem.getSelectedSize()
        );
        if (quantity > variantStock) {
            throw new InsufficientStockException(
                    cartItem.getProduct().getProductName(), quantity, variantStock
            );
        }

        cartItem.setQuantity(quantity);
        return cartMapper.toDTO(cartRepository.save(cart));
    }

    // ✅ Helper: find stock for a specific color+size variant
    private int getVariantStock(Product product, String color, String size) {
        // If product has variants, find the matching one
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            return product.getVariants().stream()
                    .filter(v ->
                            java.util.Objects.equals(v.getColor(), color) &&
                                    java.util.Objects.equals(v.getSize(), size)
                    )
                    .findFirst()
                    .map(v -> v.getQuantity())
                    .orElse(0);
        }
        // Fallback for non-variant products
        return product.getInventory() != null
                ? product.getInventory().getQuantityInStock()
                : 0;
    }
    @Override
    public CartDTO removeFromCart(Long customerId, Long cartItemId) {
        Cart cart = cartRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId));

        cart.getCartItems().removeIf(item -> item.getCartItemId().equals(cartItemId));

        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toDTO(savedCart);
    }

    @Override
    public void clearCart(Long customerId) {
        Cart cart = cartRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId));

        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
}
