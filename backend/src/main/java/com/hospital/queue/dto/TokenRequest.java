package com.hospital.queue.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TokenRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long doctorId;

    private Integer priority = 0;
}