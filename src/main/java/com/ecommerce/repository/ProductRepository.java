package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Spring Data JPA auto-generates implementation
    List<Product> findByIsActiveTrue();

    List<Product> findByCategoryCategoryId(Long categoryId);

    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Custom JPQL query
    @Query("SELECT p FROM Product p WHERE p.productName LIKE %:keyword% AND p.isActive = true")
    List<Product> searchActiveProducts(@Param("keyword") String keyword);
}