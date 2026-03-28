package com.ecommerce.service;

import com.ecommerce.dto.SupplierDTO;

import java.util.List;

public interface SupplierService {
    SupplierDTO createSupplier(SupplierDTO dto);
    SupplierDTO getSupplierById(Long id);
    List<SupplierDTO> getAllSuppliers();
    List<SupplierDTO> searchSuppliers(String name);
    SupplierDTO updateSupplier(Long id, SupplierDTO dto);
    void deleteSupplier(Long id);
}