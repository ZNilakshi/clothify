package com.ecommerce.service.impl;

import com.ecommerce.dto.SupplierDTO;
import com.ecommerce.entity.Supplier;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.SupplierRepository;
import com.ecommerce.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        log.info("Creating supplier: {}", dto.getName());

        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .taxId(dto.getTaxId())
                .paymentTerms(dto.getPaymentTerms())
                .isActive(true)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier created with id: {}", saved.getSupplierId());
        return toDTO(saved);
    }

    @Override
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return toDTO(supplier);
    }

    @Override
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findByIsActiveTrue()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SupplierDTO> searchSuppliers(String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        supplier.setTaxId(dto.getTaxId());
        supplier.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getIsActive() != null) supplier.setIsActive(dto.getIsActive());

        return toDTO(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        // Soft delete
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
        log.info("Supplier soft-deleted: {}", id);
    }

    // ── Mapper ─────────────────────────────────────────────────
    private SupplierDTO toDTO(Supplier s) {
        return SupplierDTO.builder()
                .supplierId(s.getSupplierId())
                .name(s.getName())
                .phone(s.getPhone())
                .email(s.getEmail())
                .address(s.getAddress())
                .taxId(s.getTaxId())
                .paymentTerms(s.getPaymentTerms())
                .isActive(s.getIsActive())
                .build();
    }
}