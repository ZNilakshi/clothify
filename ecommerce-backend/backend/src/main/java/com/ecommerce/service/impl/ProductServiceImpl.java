package com.ecommerce.service.impl;

import com.ecommerce.dto.ProductCreateDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductUpdateDTO;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.SubCategory;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.SubCategoryRepository;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository     productRepository;
    private final CategoryRepository    categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final ProductMapper         productMapper;

    @Override
    public ProductDTO createProduct(ProductCreateDTO dto) {
        log.info("Creating product: {}", dto.getProductName());

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        SubCategory subCategory = null;
        if (dto.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", dto.getSubCategoryId()));
        }

        Product product = productMapper.toEntity(dto, category, subCategory);

        // If variants provided, calculate total stock
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            int totalStock = dto.getVariants().stream()
                    .mapToInt(v -> v.getQuantity() != null ? v.getQuantity() : 0)
                    .sum();
            if (product.getInventory() != null) {
                product.getInventory().setQuantityInStock(totalStock);
            }
        }

        Product saved = productRepository.save(product);
        log.info("Product created with ID: {}", saved.getProductId());
        return productMapper.toDTO(saved);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductUpdateDTO dto) {
        log.info("Updating product: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
        }

        SubCategory subCategory = null;
        if (dto.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", dto.getSubCategoryId()));
        }

        productMapper.updateEntityFromDTO(product, dto, category, subCategory);

        Product updated = productRepository.save(product);
        log.info("Product updated: {}", id);
        return productMapper.toDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        return productMapper.toDTO(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProductsPaginated(Pageable pageable) {
        return productRepository.findAll(pageable).map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getActiveProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(productMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId))
            throw new ResourceNotFoundException("Category", "id", categoryId);
        return productRepository.findByCategoryCategoryId(categoryId).stream()
                .map(productMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.searchActiveProducts(keyword).stream()
                .map(productMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProductsPaginated(String keyword, Pageable pageable) {
        return productRepository.searchActiveProducts(keyword, pageable).map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice).stream()
                .map(productMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
        log.info("Product deleted: {}", id);
    }

    @Override
    public void activateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(true);
        productRepository.save(product);
    }

    @Override
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(false);
        productRepository.save(product);
    }
}