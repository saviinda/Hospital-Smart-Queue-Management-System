package com.hospital.queue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private Long totalTokensToday;
    private Long completedTokens;
    private Long waitingTokens;
    private Long cancelledTokens;
    private Double averageWaitTime;
    private Integer currentQueueLength;
}