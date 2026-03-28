package com.ecommerce.controller;

import com.ecommerce.dto.SupplierDTO;
import com.ecommerce.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    // GET /api/suppliers          → all active suppliers
    // GET /api/suppliers?name=abc → search by name
    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getSuppliers(
            @RequestParam(required = false) String name) {
        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(supplierService.searchSuppliers(name));
        }
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    // GET /api/suppliers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> getSupplier(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    // POST /api/suppliers
    @PostMapping
    public ResponseEntity<SupplierDTO> createSupplier(
            @Valid @RequestBody SupplierDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierService.createSupplier(dto));
    }

    // PUT /api/suppliers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<SupplierDTO> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, dto));
    }

    // DELETE /api/suppliers/{id}  (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}