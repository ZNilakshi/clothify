package com.ecommerce.service.impl;

import com.ecommerce.dto.LoginRequestDTO;
import com.ecommerce.dto.LoginResponseDTO;
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
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;  // ADD THIS

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserAccountRepository userAccountRepository;

    @Override
    @Transactional  // ADD THIS
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Generate JWT token
            String token = tokenProvider.generateToken(authentication);

            // Get user details
            UserAccount user = userAccountRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new BusinessException("User not found"));

            // Build response
            LoginResponseDTO response = LoginResponseDTO.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .role(user.getRole().getRoleName())  // This needs the role to be loaded
                    .build();

            // Add customer info if exists
            if (user.getCustomer() != null) {
                response.setCustomerId(user.getCustomer().getCustomerId());
                response.setEmail(user.getCustomer().getEmail());
            }

            log.info("User logged in successfully: {}", user.getUsername());

            return response;

        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", loginRequest.getUsername());
            throw new BusinessException("Invalid username or password");
        }
    }
}