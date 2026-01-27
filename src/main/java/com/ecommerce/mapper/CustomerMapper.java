package com.ecommerce.mapper;

import com.ecommerce.dto.CustomerCreateDTO;
import com.ecommerce.dto.CustomerDTO;
import com.ecommerce.entity.Customer;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.UserAccount;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerDTO toDTO(Customer customer) {
        if (customer == null) return null;

        return CustomerDTO.builder()
                .customerId(customer.getCustomerId())
                .customerName(customer.getCustomerName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())
                .username(customer.getUserAccount() != null ?
                        customer.getUserAccount().getUsername() : null)
                .build();
    }

    public Customer toEntity(CustomerCreateDTO dto, UserAccount userAccount) {
        if (dto == null) return null;

        Customer customer = Customer.builder()
                .customerName(dto.getCustomerName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .userAccount(userAccount)
                .build();

        userAccount.setCustomer(customer);

        return customer;
    }
}
