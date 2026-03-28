package com.ecommerce.service.impl;

import com.ecommerce.dto.LoginRequestDTO;
import com.ecommerce.dto.LoginResponseDTO;
import com.ecommerce.entity.Customer;
import com.ecommerce.entity.UserAccount;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.repository.UserAccountRepository;
import com.ecommerce.security.JwtTokenProvider;
import com.ecommerce.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAccountRepository userAccountRepository;

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        try {
            log.info("Attempting login for user: {}", loginRequest.getUsername());

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String token = jwtTokenProvider.generateToken(authentication);

            // Get user details
            UserAccount userAccount = userAccountRepository
                    .findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new BusinessException("User not found"));

            // Get customer if exists
            Customer customer = userAccount.getCustomer();

            log.info("Login successful for user: {}, User ID: {}, Customer ID: {}",
                    userAccount.getUsername(),
                    userAccount.getUserId(),
                    customer != null ? customer.getCustomerId() : "N/A");

            // Build response with customerId and email
            return LoginResponseDTO.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(userAccount.getUserId())
                    .username(userAccount.getUsername())
                    .role(userAccount.getRole().getRoleName())
                    .customerId(customer != null ? customer.getCustomerId() : null)
                    .email(customer != null ? customer.getEmail() : null)
                    .build();

        } catch (Exception e) {
            log.error("Login failed for user: {}", loginRequest.getUsername(), e);
            throw new BusinessException("Invalid username or password");
        }
    }
}