package com.ecommerce.dto;

import jakarta.validation.constraints.Email;
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

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String secondaryPhone;

    @NotBlank(message = "Delivery method is required")
    private String deliveryMethod; // "delivery" or "pickup"

    // Delivery address fields (required if deliveryMethod = "delivery")
    private String street;
    private String apartment;
    private String city;
    private String postal;

    // Different shipping address (optional)
    private String shipTo; // "billing" or "different"
    private String diffStreet;
    private String diffApartment;
    private String diffCity;
    private String diffPostal;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // "cod", "bank", "visa", "koko", "payzy"

    private String orderNote;

    private Long cityId; // Optional city reference
}