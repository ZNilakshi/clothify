package com.ecommerce.service.impl;

import com.ecommerce.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        try {
            // Build path: uploads/products/
            Path uploadPath = Paths.get(uploadDir, subDirectory).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + extension;

            // Save file to uploads/products/uuid.ext
            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored at: {}", targetPath);

            // ✅ Return ONLY the filename (not the subdir)
            return uniqueFileName;

        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileName, String subDirectory) {
        try {
            Path filePath = Paths.get(uploadDir, subDirectory, fileName).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete file", e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    @Override
    public byte[] loadFile(String fileName, String subDirectory) {
        try {
            Path filePath = Paths.get(uploadDir, subDirectory, fileName).toAbsolutePath().normalize();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load file: " + e.getMessage());
        }
    }
}