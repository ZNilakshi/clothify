package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierDTO {

    private Long supplierId;

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String phone;
    private String email;
    private String address;
    private String taxId;
    private String paymentTerms;
    private Boolean isActive;
}