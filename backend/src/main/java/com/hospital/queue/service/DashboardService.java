package com.hospital.queue.service;

import com.hospital.queue.dto.DashboardStatsResponse;
import com.hospital.queue.entity.Token;
import com.hospital.queue.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TokenRepository tokenRepository;

    public DashboardStatsResponse getTodayStats(Long departmentId) {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        // Get all tokens for today
        var todayTokens = tokenRepository.findCompletedTokensByDepartmentAndDateRange(
                departmentId,
                startOfDay,
                endOfDay
        );

        long totalTokens = todayTokens.size();
        long completed = todayTokens.stream()
                .filter(t -> t.getStatus() == Token.TokenStatus.COMPLETED)
                .count();

        long waiting = tokenRepository.countByDepartmentIdAndStatus(
                departmentId,
                Token.TokenStatus.WAITING
        );

        long cancelled = todayTokens.stream()
                .filter(t -> t.getStatus() == Token.TokenStatus.CANCELLED)
                .count();

        Double avgWaitTime = tokenRepository.getAverageWaitTimeByDepartment(departmentId);

        return new DashboardStatsResponse(
                totalTokens,
                completed,
                waiting,
                cancelled,
                avgWaitTime != null ? avgWaitTime : 0.0,
                waiting.intValue()
        );
    }
}