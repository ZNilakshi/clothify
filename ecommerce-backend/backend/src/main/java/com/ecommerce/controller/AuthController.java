package com.ecommerce.controller;

import com.ecommerce.dto.CustomerCreateDTO;
import com.ecommerce.dto.CustomerDTO;
import com.ecommerce.dto.LoginRequestDTO;
import com.ecommerce.dto.LoginResponseDTO;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final CustomerService customerService;

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        log.info("POST /api/auth/login - Username: {}", loginRequest.getUsername());
        LoginResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<CustomerDTO> register(@Valid @RequestBody CustomerCreateDTO customerCreateDTO) {
        log.info("POST /api/auth/register - Email: {}", customerCreateDTO.getEmail());
        CustomerDTO customer = customerService.registerCustomer(customerCreateDTO);
        return new ResponseEntity<>(customer, HttpStatus.CREATED);
    }
}