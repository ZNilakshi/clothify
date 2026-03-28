package com.ecommerce.service.impl;

import com.ecommerce.dto.CustomerCreateDTO;
import com.ecommerce.dto.CustomerDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.Customer;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.UserAccount;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.CustomerMapper;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.CustomerRepository;
import com.ecommerce.repository.RoleRepository;
import com.ecommerce.repository.UserAccountRepository;
import com.ecommerce.service.CustomerService;
import com.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserAccountRepository userAccountRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public CustomerDTO registerCustomer(CustomerCreateDTO dto) {
        log.info("Registering new customer: {}", dto.getEmail());

        // Validation
        if (customerRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email already registered");
        }
        if (userAccountRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("Username already taken");
        }

        // Get or create CUSTOMER role
        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("CUSTOMER")
                                .roleDescription("Customer role")
                                .build()
                ));

        // Create UserAccount
        UserAccount userAccount = UserAccount.builder()
                .username(dto.getUsername())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .isActive(true)
                .role(customerRole)
                .build();

        // Save UserAccount first
        UserAccount savedUserAccount = userAccountRepository.save(userAccount);

        // Create Customer
        Customer customer = Customer.builder()
                .customerName(dto.getCustomerName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .userAccount(savedUserAccount)
                .build();

        // Set bidirectional relationship
        savedUserAccount.setCustomer(customer);

        // Create Cart
        Cart cart = Cart.builder()
                .customer(customer)
                .build();
        customer.setCart(cart);

        // Save Customer
        Customer savedCustomer = customerRepository.save(customer);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(
                    savedCustomer.getEmail(),
                    savedCustomer.getCustomerName()
            );
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
        }

        return customerMapper.toDTO(savedCustomer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer", "id", id)
                );
        return customerMapper.toDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer", "email", email)
                );
        return customerMapper.toDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer", "id", id)
                );
        customerRepository.delete(customer);
    }
}
