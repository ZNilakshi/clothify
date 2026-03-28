package com.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "sub_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sub_category_id")
    private Long subCategoryId;

    @NotBlank(message = "Sub category name is required")
    @Column(name = "sub_category_name", nullable = false, length = 100)
    private String subCategoryName;

    @Column(name = "sub_category_description", columnDefinition = "TEXT")
    private String subCategoryDescription;

    @Column(name = "image_url")
    private String imageUrl;

    // Many SubCategories → One Category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_subcategory_category"))
    private Category category;
}