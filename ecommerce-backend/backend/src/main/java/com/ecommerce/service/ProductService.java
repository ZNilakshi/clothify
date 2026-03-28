package com.ecommerce.service;

import com.ecommerce.dto.ProductCreateDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    ProductDTO createProduct(ProductCreateDTO productCreateDTO);
    ProductDTO updateProduct(Long id, ProductUpdateDTO productUpdateDTO);
    ProductDTO getProductById(Long id);
    List<ProductDTO> getAllProducts();
    Page<ProductDTO> getAllProductsPaginated(Pageable pageable);  // NEW
    List<ProductDTO> getActiveProducts();
    List<ProductDTO> getProductsByCategory(Long categoryId);
    List<ProductDTO> searchProducts(String keyword);
    Page<ProductDTO> searchProductsPaginated(String keyword, Pageable pageable);  // NEW
    List<ProductDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice);
    void deleteProduct(Long id);
    void activateProduct(Long id);
    void deactivateProduct(Long id);
}