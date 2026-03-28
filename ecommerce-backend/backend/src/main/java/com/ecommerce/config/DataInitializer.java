package com.ecommerce.config;

import com.ecommerce.entity.Role;
import com.ecommerce.entity.UserAccount;
import com.ecommerce.repository.RoleRepository;
import com.ecommerce.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create roles if they don't exist
        createRoleIfNotExists("ADMIN", "Administrator role");
        createRoleIfNotExists("CUSTOMER", "Customer role");

        // Create admin user if doesn't exist
        createAdminUserIfNotExists();
    }

    private void createRoleIfNotExists(String roleName, String description) {
        if (roleRepository.findByRoleName(roleName).isEmpty()) {
            Role role = Role.builder()
                    .roleName(roleName)
                    .roleDescription(description)
                    .build();
            roleRepository.save(role);
            log.info("Created role: {}", roleName);
        }
    }

    private void createAdminUserIfNotExists() {
        if (userAccountRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            UserAccount admin = UserAccount.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .isActive(true)
                    .role(adminRole)
                    .build();

            userAccountRepository.save(admin);
            log.info("Created admin user - Username: admin, Password: admin123");
        }
    }
}