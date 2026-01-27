package com.ecommerce.service;

import com.ecommerce.dto.CustomerCreateDTO;
import com.ecommerce.dto.CustomerDTO;
import java.util.List;

public interface CustomerService {
    CustomerDTO registerCustomer(CustomerCreateDTO dto);
    CustomerDTO getCustomerById(Long id);
    CustomerDTO getCustomerByEmail(String email);
    List<CustomerDTO> getAllCustomers();
    void deleteCustomer(Long id);
}
