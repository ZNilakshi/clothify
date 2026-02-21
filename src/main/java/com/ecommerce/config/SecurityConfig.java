package com.ecommerce.config;

import com.ecommerce.security.CustomUserDetailsService;
import com.ecommerce.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ===== PUBLIC - Static file serving =====
                        .requestMatchers("/uploads/**").permitAll()

                        // ===== PUBLIC - File GET =====
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()

                        // ===== PUBLIC - Auth =====
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/customers/register").permitAll()

                        // ===== PUBLIC - Products (read only) =====
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                        // ===== PUBLIC - Categories (read only) =====
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                        // ===== PUBLIC - SubCategories (read only) =====
                        .requestMatchers(HttpMethod.GET, "/api/subcategories/**").permitAll()

                        // ===== PUBLIC - Cities (read only) =====
                        .requestMatchers(HttpMethod.GET, "/api/cities/**").permitAll()

                        // ===== ADMIN - File management =====
                        .requestMatchers(HttpMethod.POST,   "/api/files/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/files/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/files/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/files/**").hasRole("ADMIN")

                        // ===== ADMIN - Product management =====
                        .requestMatchers(HttpMethod.POST,   "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/products/**").hasRole("ADMIN")

                        // ===== ADMIN - Category management =====
                        .requestMatchers(HttpMethod.POST,   "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/categories/**").hasRole("ADMIN")

                        // ===== ADMIN - SubCategory management =====
                        .requestMatchers(HttpMethod.POST,   "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/subcategories/**").hasRole("ADMIN")

                        // ===== CUSTOMER + ADMIN - Orders =====
                        .requestMatchers("/api/orders/customer/**").hasAnyRole("CUSTOMER", "ADMIN")

                        // ===== Everything else requires authentication =====
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
