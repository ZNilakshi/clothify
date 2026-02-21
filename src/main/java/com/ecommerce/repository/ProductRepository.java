package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByIsActiveTrue();

    List<Product> findByCategoryCategoryId(Long categoryId);

    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    @Query("SELECT p FROM Product p WHERE p.productName LIKE %:keyword% AND p.isActive = true")
    List<Product> searchActiveProducts(@Param("keyword") String keyword);

    // NEW - Paginated search
    @Query("SELECT p FROM Product p WHERE p.productName LIKE %:keyword% AND p.isActive = true")
    Page<Product> searchActiveProducts(@Param("keyword") String keyword, Pageable pageable);
}