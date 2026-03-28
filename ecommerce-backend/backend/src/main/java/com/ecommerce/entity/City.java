package com.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class City extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "city_id")
    private Long cityId;

    @NotBlank(message = "City name is required")
    @Column(name = "city_name", nullable = false, length = 100)
    private String cityName;

    @Column(name = "region", length = 100)
    private String region;

    // One City → Many Orders
    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Order> orders = new HashSet<>();
}