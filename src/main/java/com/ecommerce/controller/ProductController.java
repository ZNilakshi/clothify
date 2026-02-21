package com.ecommerce.controller;

import com.ecommerce.dto.ProductCreateDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductUpdateDTO;
import com.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")  // Allow requests from any origin (configure properly in production)
public class ProductController {

    private final ProductService productService;

    // GET /api/products - Get all products
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        log.info("GET /api/products - Fetching all products");
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // GET /api/products/{id} - Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        log.info("GET /api/products/{} - Fetching product", id);
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    // GET /api/products/active - Get active products
    @GetMapping("/active")
    public ResponseEntity<List<ProductDTO>> getActiveProducts() {
        log.info("GET /api/products/active - Fetching active products");
        List<ProductDTO> products = productService.getActiveProducts();
        return ResponseEntity.ok(products);
    }

    // GET /api/products/category/{categoryId} - Get products by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        log.info("GET /api/products/category/{} - Fetching products", categoryId);
        List<ProductDTO> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    // GET /api/products/search?keyword=laptop
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam String keyword) {
        log.info("GET /api/products/search?keyword={}", keyword);
        List<ProductDTO> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    // GET /api/products/price-range?min=100&max=500
    @GetMapping("/price-range")
    public ResponseEntity<List<ProductDTO>> getProductsByPriceRange(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max) {
        log.info("GET /api/products/price-range?min={}&max={}", min, max);
        List<ProductDTO> products = productService.getProductsByPriceRange(min, max);
        return ResponseEntity.ok(products);
    }

    // POST /api/products - Create new product
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductCreateDTO productCreateDTO) {
        log.info("POST /api/products - Creating new product: {}", productCreateDTO.getProductName());
        ProductDTO createdProduct = productService.createProduct(productCreateDTO);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }
    @Operation(summary = "Get all products (Paginated)", description = "Retrieve paginated list of products")
    @GetMapping("/paginated")
    public ResponseEntity<Page<ProductDTO>> getAllProductsPaginated(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "productId") String sortBy,
            @Parameter(description = "Sort direction (ASC/DESC)") @RequestParam(defaultValue = "ASC") String direction) {

        Sort.Direction sortDirection = "DESC".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<ProductDTO> products = productService.getAllProductsPaginated(pageable);
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Search products (Paginated)", description = "Search products with pagination")
    @GetMapping("/search/paginated")
    public ResponseEntity<Page<ProductDTO>> searchProductsPaginated(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.searchProductsPaginated(keyword, pageable);
        return ResponseEntity.ok(products);
    }
    // PUT /api/products/{id} - Update product
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateDTO productUpdateDTO) {
        log.info("PUT /api/products/{} - Updating product", id);
        ProductDTO updatedProduct = productService.updateProduct(id, productUpdateDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    // DELETE /api/products/{id} - Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("DELETE /api/products/{} - Deleting product", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/products/{id}/activate - Activate product
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateProduct(@PathVariable Long id) {
        log.info("PATCH /api/products/{}/activate", id);
        productService.activateProduct(id);
        return ResponseEntity.ok().build();
    }

    // PATCH /api/products/{id}/deactivate - Deactivate product
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateProduct(@PathVariable Long id) {
        log.info("PATCH /api/products/{}/deactivate", id);
        productService.deactivateProduct(id);
        return ResponseEntity.ok().build();
    }
}