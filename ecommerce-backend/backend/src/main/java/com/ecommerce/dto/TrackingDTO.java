package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingDTO {
    private String trackingNumber;
    private String carrier;
    private LocalDate estimatedDelivery;
    private String trackingUrl;
}