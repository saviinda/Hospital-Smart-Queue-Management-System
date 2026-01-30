package com.hospital.queue.controller;

import com.hospital.queue.dto.DashboardStatusResponse;
import com.hospital.queue.dto.DashboardStatusResponse;
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
    public ResponseEntity<DashboardStatusResponse> getDepartmentStats(@PathVariable Long departmentId) {
        DashboardStatusResponse stats = dashboardService.getTodayStats(departmentId);
        return ResponseEntity.ok(stats);
    }
}