package com.ecommerce.exception;

public class InsufficientStockException extends BusinessException {
    public InsufficientStockException(String productName, int requested, int available) {
        super(String.format("Insufficient stock for product '%s'. Requested: %d, Available: %d",
                productName, requested, available));
    }
}