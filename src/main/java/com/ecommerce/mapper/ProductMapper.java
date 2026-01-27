package com.ecommerce.mapper;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductCreateDTO;
import com.ecommerce.dto.ProductUpdateDTO;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product product) {
        if (product == null) {
            return null;
        }

        return ProductDTO.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productDescription(product.getProductDescription())
                .price(product.getPrice())
                .isActive(product.getIsActive())
                .categoryId(product.getCategory() != null ?
                        product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ?
                        product.getCategory().getCategoryName() : null)
                .stockQuantity(product.getInventory() != null ?
                        product.getInventory().getQuantityInStock() : 0)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public Product toEntity(ProductCreateDTO dto, Category category) {
        if (dto == null) {
            return null;
        }

        Product product = Product.builder()
                .productName(dto.getProductName())
                .productDescription(dto.getProductDescription())
                .price(dto.getPrice())
                .isActive(true)
                .category(category)
                .build();

        // Create associated inventory
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

        return product;
    }

    public void updateEntityFromDTO(Product product, ProductUpdateDTO dto,
                                    Category category) {
        if (dto.getProductName() != null) {
            product.setProductName(dto.getProductName());
        }
        if (dto.getProductDescription() != null) {
            product.setProductDescription(dto.getProductDescription());
        }
        if (dto.getPrice() != null) {
            product.setPrice(dto.getPrice());
        }
        if (dto.getCategoryId() != null && category != null) {
            product.setCategory(category);
        }
        if (dto.getIsActive() != null) {
            product.setIsActive(dto.getIsActive());
        }
    }
}