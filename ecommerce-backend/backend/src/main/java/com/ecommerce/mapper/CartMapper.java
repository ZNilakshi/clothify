package com.ecommerce.mapper;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartItemDTO toCartItemDTO(CartItem cartItem) {
        if (cartItem == null) return null;

        Product product = cartItem.getProduct();
        BigDecimal unitPrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                ? product.getDiscountPrice()
                : product.getSellingPrice();

        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CartItemDTO.builder()
                .cartItemId(cartItem.getCartItemId())
                .productId(product.getProductId())
                .productName(product.getProductName())
                .imageUrl(product.getImageUrl())
                .categoryName(product.getCategory() != null
                        ? product.getCategory().getCategoryName()
                        : null)
                .unitPrice(unitPrice)
                .sellingPrice(product.getSellingPrice())
                .discountPrice(product.getDiscountPrice())
                .discount(product.getDiscount())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .color(cartItem.getSelectedColor())
                .size(cartItem.getSelectedSize())
                .build();
    }

    public CartDTO toDTO(Cart cart) {
        if (cart == null) return null;

        var items = cart.getCartItems().stream()
                .map(this::toCartItemDTO)
                .collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .cartId(cart.getCartId())
                .customerId(cart.getCustomer().getCustomerId())
                .items(items)
                .totalAmount(total)
                .build();
    }
}