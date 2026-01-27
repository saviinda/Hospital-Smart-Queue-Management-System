package com.hospital.queue.dto;

import com.hospital.queue.entity.Token;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TokenResponse {
    private Long id;
    private String tokenNumber;
    private Long userId;
    private String patientName;
    private Long departmentId;
    private String departmentName;
    private Token.TokenStatus status;
    private LocalDateTime bookingTime;
    private Integer estimatedWaitTime;
    private Integer queuePosition;
    private LocalDateTime serviceStartTime;
    private LocalDateTime serviceEndTime;
}