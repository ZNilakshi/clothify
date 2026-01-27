package com.ecommerce.service.impl;

import com.ecommerce.dto.ProductCreateDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductUpdateDTO;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service  // Marks this as a service component
@RequiredArgsConstructor  // Lombok: generates constructor for final fields
@Slf4j  // Lombok: generates logger
@Transactional  // All methods run in transactions
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductDTO createProduct(ProductCreateDTO productCreateDTO) {
        log.info("Creating new product: {}", productCreateDTO.getProductName());

        // Validate category exists
        Category category = categoryRepository.findById(productCreateDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category", "id", productCreateDTO.getCategoryId()));

        // Convert DTO to Entity
        Product product = productMapper.toEntity(productCreateDTO, category);

        // Save to database
        Product savedProduct = productRepository.save(product);

        log.info("Product created successfully with ID: {}", savedProduct.getProductId());

        // Convert Entity back to DTO and return
        return productMapper.toDTO(savedProduct);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductUpdateDTO productUpdateDTO) {
        log.info("Updating product with ID: {}", id);

        // Find existing product
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // If category is being updated, validate it exists
        Category category = null;
        if (productUpdateDTO.getCategoryId() != null) {
            category = categoryRepository.findById(productUpdateDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category", "id", productUpdateDTO.getCategoryId()));
        }

        // Update entity from DTO
        productMapper.updateEntityFromDTO(product, productUpdateDTO, category);

        // Save changes
        Product updatedProduct = productRepository.save(product);

        log.info("Product updated successfully: {}", id);

        return productMapper.toDTO(updatedProduct);
    }

    @Override
    @Transactional(readOnly = true)  // Optimization for read-only operations
    public ProductDTO getProductById(Long id) {
        log.debug("Fetching product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        return productMapper.toDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        log.debug("Fetching all products");

        return productRepository.findAll().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getActiveProducts() {
        log.debug("Fetching active products");

        return productRepository.findByIsActiveTrue().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        log.debug("Fetching products for category ID: {}", categoryId);

        // Validate category exists
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", "id", categoryId);
        }

        return productRepository.findByCategoryCategoryId(categoryId).stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String keyword) {
        log.debug("Searching products with keyword: {}", keyword);

        return productRepository.searchActiveProducts(keyword).stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        log.debug("Fetching products in price range: {} - {}", minPrice, maxPrice);

        return productRepository.findByPriceBetween(minPrice, maxPrice).stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Long id) {
        log.info("Deleting product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        productRepository.delete(product);

        log.info("Product deleted successfully: {}", id);
    }

    @Override
    public void activateProduct(Long id) {
        log.info("Activating product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setIsActive(true);
        productRepository.save(product);

        log.info("Product activated successfully: {}", id);
    }

    @Override
    public void deactivateProduct(Long id) {
        log.info("Deactivating product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setIsActive(false);
        productRepository.save(product);

        log.info("Product deactivated successfully: {}", id);
    }
}