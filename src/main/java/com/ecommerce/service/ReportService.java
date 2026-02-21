package com.ecommerce.service;

import com.ecommerce.dto.ProductSalesDTO;
import com.ecommerce.dto.SalesReportDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    SalesReportDTO getDailySalesReport(LocalDate date);
    SalesReportDTO getMonthlySalesReport(int year, int month);
    List<ProductSalesDTO> getTopSellingProducts(int limit);
    List<ProductSalesDTO> getProductSalesByDateRange(LocalDate startDate, LocalDate endDate);
}