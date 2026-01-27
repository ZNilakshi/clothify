package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "City ID is required")
    private Long cityId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String shippingAddress;
    private String notes;
}