package com.ecommerce.mapper;

import com.ecommerce.dto.ProductCreateDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductUpdateDTO;
import com.ecommerce.dto.ProductVariantDTO;
import com.ecommerce.entity.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class ProductMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProductDTO toDTO(Product product) {
        if (product == null) return null;

        return ProductDTO.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productDescription(product.getProductDescription())
                .sku(product.getSku())
                .price(product.getPrice())
                .unitPrice(product.getUnitPrice())
                .sellingPrice(product.getSellingPrice())
                .margin(product.getMargin())
                .discount(product.getDiscount())               // ← NEW
                .discountPrice(product.getDiscountPrice())     // ← NEW
                .isActive(product.getIsActive())
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .subCategoryId(product.getSubCategory() != null ? product.getSubCategory().getSubCategoryId() : null)
                .subCategoryName(product.getSubCategory() != null ? product.getSubCategory().getSubCategoryName() : null)
                .stockQuantity(product.getInventory() != null ? product.getInventory().getQuantityInStock() : 0)
                .imageUrl(product.getImageUrl())
                .imageUrls(parseImageUrls(product.getImageUrls()))
                .variants(variantsToDTO(product.getVariants()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public Product toEntity(ProductCreateDTO dto, Category category, SubCategory subCategory) {
        if (dto == null) return null;

        // Auto-calculate discountPrice if discount is provided
        BigDecimal discountPrice = calculateDiscountPrice(dto.getSellingPrice(), dto.getDiscount());

        Product product = Product.builder()
                .productName(dto.getProductName())
                .productDescription(dto.getProductDescription())
                .sku(dto.getSku())
                .price(dto.getPrice())
                .unitPrice(dto.getUnitPrice())
                .sellingPrice(dto.getSellingPrice())
                .margin(dto.getMargin())
                .discount(dto.getDiscount())           // ← NEW
                .discountPrice(discountPrice)          // ← NEW (auto-calculated)
                .isActive(true)
                .category(category)
                .subCategory(subCategory)
                .imageUrl(dto.getImageUrl())
                .imageUrls(toJsonString(dto.getImageUrls()))
                .build();

        // Create inventory
        if (dto.getInitialStock() != null) {
            Inventory inventory = Inventory.builder()
                    .quantityInStock(dto.getInitialStock())
                    .reorderLevel(dto.getReorderLevel())
                    .unitOfMeasure(dto.getUnitOfMeasure())
                    .price(dto.getPrice())
                    .product(product)
                    .build();
            product.setInventory(inventory);
        }

        // Create variants
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            List<ProductVariant> variants = dto.getVariants().stream()
                    .map(v -> ProductVariant.builder()
                            .color(v.getColor())
                            .size(v.getSize())
                            .quantity(v.getQuantity())
                            .sku(v.getSku())
                            .product(product)
                            .build())
                    .collect(Collectors.toList());
            product.setVariants(variants);
        }

        return product;
    }

    public void updateEntityFromDTO(Product product, ProductUpdateDTO dto,
                                    Category category, SubCategory subCategory) {
        if (dto.getProductName()        != null) product.setProductName(dto.getProductName());
        if (dto.getProductDescription() != null) product.setProductDescription(dto.getProductDescription());
        if (dto.getSku()                != null) product.setSku(dto.getSku());
        if (dto.getPrice()              != null) product.setPrice(dto.getPrice());
        if (dto.getUnitPrice()          != null) product.setUnitPrice(dto.getUnitPrice());
        if (dto.getSellingPrice()       != null) product.setSellingPrice(dto.getSellingPrice());
        if (dto.getMargin()             != null) product.setMargin(dto.getMargin());
        if (dto.getIsActive()           != null) product.setIsActive(dto.getIsActive());
        if (dto.getImageUrl()           != null) product.setImageUrl(dto.getImageUrl());
        if (dto.getImageUrls()          != null) product.setImageUrls(toJsonString(dto.getImageUrls()));
        if (category                    != null) product.setCategory(category);
        if (subCategory                 != null) product.setSubCategory(subCategory);
        else if (dto.getSubCategoryId() == null) product.setSubCategory(null);

        // ── Discount — auto-calculate discountPrice ──────────
        if (dto.getDiscount() != null) {
            product.setDiscount(dto.getDiscount());

            // Use updated sellingPrice if provided, otherwise use existing
            BigDecimal sellingPrice = dto.getSellingPrice() != null
                    ? dto.getSellingPrice()
                    : product.getSellingPrice();

            product.setDiscountPrice(calculateDiscountPrice(sellingPrice, dto.getDiscount()));

        } else if (dto.getSellingPrice() != null && product.getDiscount() != null) {
            // sellingPrice changed but discount stays — recalculate discountPrice
            product.setDiscountPrice(
                    calculateDiscountPrice(dto.getSellingPrice(), product.getDiscount())
            );
        }

        // ── Inventory ─────────────────────────────────────────
        if (product.getInventory() != null) {
            if (dto.getReorderLevel()  != null) product.getInventory().setReorderLevel(dto.getReorderLevel());
            if (dto.getUnitOfMeasure() != null) product.getInventory().setUnitOfMeasure(dto.getUnitOfMeasure());
            if (dto.getPrice()         != null) product.getInventory().setPrice(dto.getPrice());
        }

        // ── Variants ──────────────────────────────────────────
        if (dto.getVariants() != null) {
            product.getVariants().clear();
            dto.getVariants().forEach(v -> product.getVariants().add(
                    ProductVariant.builder()
                            .color(v.getColor())
                            .size(v.getSize())
                            .quantity(v.getQuantity())
                            .sku(v.getSku())
                            .product(product)
                            .build()
            ));

            // Recalculate total stock from variants
            if (product.getInventory() != null && !dto.getVariants().isEmpty()) {
                int totalStock = dto.getVariants().stream()
                        .mapToInt(v -> v.getQuantity() != null ? v.getQuantity() : 0)
                        .sum();
                product.getInventory().setQuantityInStock(totalStock);
            }
        }
    }

    // ── Helpers ────────────────────────────────────────────────

    /**
     * Calculates price after discount.
     * e.g. sellingPrice=100, discount=20 → discountPrice=80
     */
    private BigDecimal calculateDiscountPrice(BigDecimal sellingPrice, BigDecimal discount) {
        if (sellingPrice == null) return null;
        if (discount == null || discount.compareTo(BigDecimal.ZERO) <= 0) return sellingPrice;

        BigDecimal discountAmount = sellingPrice
                .multiply(discount)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        return sellingPrice.subtract(discountAmount);
    }

    private List<ProductVariantDTO> variantsToDTO(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) return Collections.emptyList();
        return variants.stream()
                .map(v -> ProductVariantDTO.builder()
                        .variantId(v.getVariantId())
                        .color(v.getColor())
                        .size(v.getSize())
                        .quantity(v.getQuantity())
                        .sku(v.getSku())
                        .build())
                .collect(Collectors.toList());
    }

    private String toJsonString(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            log.error("Failed to serialize imageUrls", e);
            return null;
        }
    }

    private List<String> parseImageUrls(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("Failed to parse imageUrls", e);
            return Collections.emptyList();
        }
    }
}