package com.hospital.queue.service;

import com.hospital.queue.dto.DashboardStatusResponse;
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

    public DashboardStatusResponse getTodayStats(Long departmentId) {
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

        return new DashboardStatusResponse(
                totalTokens,
                completed,
                waiting,
                cancelled,
                avgWaitTime != null ? avgWaitTime : 0.0,
                Math.toIntExact(waiting)

        );
    }
}