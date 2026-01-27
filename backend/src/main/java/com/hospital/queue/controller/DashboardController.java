package com.hospital.queue.controller;

import com.hospital.queue.dto.DashboardStatsResponse;
import com.hospital.queue.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats/{departmentId}")
    public ResponseEntity<DashboardStatsResponse> getDepartmentStats(@PathVariable Long departmentId) {
        DashboardStatsResponse stats = dashboardService.getTodayStats(departmentId);
        return ResponseEntity.ok(stats);
    }
}