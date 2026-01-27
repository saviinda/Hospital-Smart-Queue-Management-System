package com.hospital.queue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WaitTimePredictionResponse {
    private Integer estimatedWaitTime;
    private Integer queueLength;
}