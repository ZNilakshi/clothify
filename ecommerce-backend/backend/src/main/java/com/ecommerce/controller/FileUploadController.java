package com.ecommerce.controller;

import com.ecommerce.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Uploading file: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size must not exceed 5MB");
        }

        // storeFile returns just "uuid.ext" (filename only)
        String fileName = fileStorageService.storeFile(file, "products");

        // ✅ Correct URL: /uploads/products/uuid.ext
        String fileUrl = "/uploads/products/" + fileName;

        Map<String, String> response = new HashMap<>();
        response.put("fileName", fileName);
        response.put("fileUrl", fileUrl);

        log.info("File uploaded: {}", fileUrl);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/products/{fileName}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String fileName) {
        log.info("Deleting file: {}", fileName);
        fileStorageService.deleteFile(fileName, "products");
        Map<String, String> response = new HashMap<>();
        response.put("message", "File deleted successfully");
        return ResponseEntity.ok(response);
    }
}