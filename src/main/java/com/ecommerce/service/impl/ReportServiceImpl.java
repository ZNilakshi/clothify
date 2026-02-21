package com.ecommerce.service.impl;

import com.ecommerce.dto.ProductSalesDTO;
import com.ecommerce.dto.SalesReportDTO;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;

    @Override
    public SalesReportDTO getDailySalesReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        var orders = orderRepository.findByOrderDateBetween(startOfDay, endOfDay);

        BigDecimal totalRevenue = orders.stream()
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();

        BigDecimal avgOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long uniqueCustomers = orders.stream()
                .map(o -> o.getCustomer().getCustomerId())
                .distinct()
                .count();

        return SalesReportDTO.builder()
                .date(date)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .averageOrderValue(avgOrderValue)
                .totalCustomers(uniqueCustomers)
                .build();
    }

    @Override
    public SalesReportDTO getMonthlySalesReport(int year, int month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());

        LocalDateTime startOfMonth = firstDay.atStartOfDay();
        LocalDateTime endOfMonth = lastDay.atTime(LocalTime.MAX);

        var orders = orderRepository.findByOrderDateBetween(startOfMonth, endOfMonth);

        BigDecimal totalRevenue = orders.stream()
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SalesReportDTO.builder()
                .totalOrders((long) orders.size())
                .totalRevenue(totalRevenue)
                .averageOrderValue(orders.isEmpty() ? BigDecimal.ZERO
                        : totalRevenue.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP))
                .build();
    }

    @Override
    public List<ProductSalesDTO> getTopSellingProducts(int limit) {
        var allOrders = orderRepository.findAll();

        return allOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getProduct(),
                        Collectors.summingInt(item -> item.getQuantity())
                ))
                .entrySet().stream()
                .map(entry -> ProductSalesDTO.builder()
                        .productId(entry.getKey().getProductId())
                        .productName(entry.getKey().getProductName())
                        .quantitySold(entry.getValue().longValue())
                        .build())
                .sorted((a, b) -> Long.compare(b.getQuantitySold(), a.getQuantitySold()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductSalesDTO> getProductSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        var orders = orderRepository.findByOrderDateBetween(start, end);

        return orders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getProduct(),
                        Collectors.reducing(
                                ProductSalesDTO.builder().quantitySold(0L).totalRevenue(BigDecimal.ZERO).build(),
                                item -> ProductSalesDTO.builder()
                                        .productId(item.getProduct().getProductId())
                                        .productName(item.getProduct().getProductName())
                                        .quantitySold((long) item.getQuantity())
                                        .totalRevenue(item.getLineTotal())
                                        .build(),
                                (a, b) -> ProductSalesDTO.builder()
                                        .productId(a.getProductId() != null ? a.getProductId() : b.getProductId())
                                        .productName(a.getProductName() != null ? a.getProductName() : b.getProductName())
                                        .quantitySold(a.getQuantitySold() + b.getQuantitySold())
                                        .totalRevenue(a.getTotalRevenue().add(b.getTotalRevenue()))
                                        .build()
                        )
                ))
                .values().stream()
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .collect(Collectors.toList());
    }
}