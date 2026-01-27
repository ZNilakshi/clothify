package com.ecommerce.controller;

import com.ecommerce.dto.CityDTO;
import com.ecommerce.entity.City;
import com.ecommerce.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CityController {

    private final CityRepository cityRepository;

    @GetMapping
    public ResponseEntity<List<CityDTO>> getAllCities() {
        List<CityDTO> cities = cityRepository.findAll().stream()
                .map(city -> CityDTO.builder()
                        .cityId(city.getCityId())
                        .cityName(city.getCityName())
                        .region(city.getRegion())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(cities);
    }

    @PostMapping
    public ResponseEntity<CityDTO> createCity(@RequestBody CityDTO dto) {
        City city = City.builder()
                .cityName(dto.getCityName())
                .region(dto.getRegion())
                .build();

        City saved = cityRepository.save(city);

        return ResponseEntity.ok(CityDTO.builder()
                .cityId(saved.getCityId())
                .cityName(saved.getCityName())
                .region(saved.getRegion())
                .build());
    }
}