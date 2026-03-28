package com.ecommerce.mapper;

import com.ecommerce.dto.CustomerCreateDTO;
import com.ecommerce.dto.CustomerDTO;
import com.ecommerce.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerDTO toDTO(Customer customer) {
        if (customer == null) return null;

        return CustomerDTO.builder()
                .customerId(customer.getCustomerId())
                .customerName(customer.getCustomerName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())  // ← phoneNumber
                .address(customer.getAddress())
                .city(customer.getCity())
                .postalCode(customer.getPostalCode())
                .build();
    }

    public Customer toEntity(CustomerCreateDTO dto) {
        if (dto == null) return null;

        return Customer.builder()
                .customerName(dto.getCustomerName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())  // ← phoneNumber
                .address(dto.getAddress())
                .city(dto.getCity())
                .postalCode(dto.getPostalCode())
                .build();
    }
}