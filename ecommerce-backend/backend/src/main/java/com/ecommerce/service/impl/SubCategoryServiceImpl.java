package com.ecommerce.service.impl;

import com.ecommerce.dto.SubCategoryCreateDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.SubCategory;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.SubCategoryMapper;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.SubCategoryRepository;
import com.ecommerce.service.SubCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubCategoryServiceImpl implements SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryMapper subCategoryMapper;

    @Override
    public SubCategoryDTO createSubCategory(SubCategoryCreateDTO dto) {
        log.info("Creating sub category: {}", dto.getSubCategoryName());

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        if (subCategoryRepository.existsBySubCategoryNameAndCategoryCategoryId(
                dto.getSubCategoryName(), dto.getCategoryId())) {
            throw new BusinessException("Sub category '" + dto.getSubCategoryName()
                    + "' already exists in this category");
        }

        SubCategory subCategory = subCategoryMapper.toEntity(dto, category);
        subCategory.setImageUrl(dto.getImageUrl());   // ← ADDED

        SubCategory saved = subCategoryRepository.save(subCategory);
        return subCategoryMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SubCategoryDTO getSubCategoryById(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", id));
        return subCategoryMapper.toDTO(subCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubCategoryDTO> getAllSubCategories() {
        return subCategoryRepository.findAll().stream()
                .map(subCategoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubCategoryDTO> getSubCategoriesByCategoryId(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", "id", categoryId);
        }
        return subCategoryRepository.findByCategoryCategoryId(categoryId).stream()
                .map(subCategoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SubCategoryDTO updateSubCategory(Long id, SubCategoryCreateDTO dto) {
        log.info("Updating sub category: {}", id);

        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", id));

        if (dto.getCategoryId() != null &&
                !dto.getCategoryId().equals(subCategory.getCategory().getCategoryId())) {
            Category newCategory = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
            subCategory.setCategory(newCategory);
        }

        subCategory.setSubCategoryName(dto.getSubCategoryName());
        subCategory.setSubCategoryDescription(dto.getSubCategoryDescription());
        subCategory.setImageUrl(dto.getImageUrl());   // ← ADDED

        return subCategoryMapper.toDTO(subCategoryRepository.save(subCategory));
    }

    @Override
    public void deleteSubCategory(Long id) {
        log.info("Deleting sub category: {}", id);
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", id));
        subCategoryRepository.delete(subCategory);
    }
}