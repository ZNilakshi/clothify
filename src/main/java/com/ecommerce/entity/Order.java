package com.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_customer", columnList = "customer_id"),
        @Index(name = "idx_order_date", columnList = "order_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @NotNull
    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "order_status", length = 50)
    @Builder.Default
    private String orderStatus = "PENDING";

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // Many Orders → One Customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_order_customer"))
    private Customer customer;

    // Many Orders → One City
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id",
            foreignKey = @ForeignKey(name = "fk_order_city"))
    private City city;

    // One Order → Many OrderItems
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL,
            orphanRemoval = true)
    @Builder.Default
    private Set<OrderItem> orderItems = new HashSet<>();

    // One Order → One Payment
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Payment payment;

    // One Order → One Sale
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Sale sale;
}