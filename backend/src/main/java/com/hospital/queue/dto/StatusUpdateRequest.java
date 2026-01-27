package com.hospital.queue.dto;

import com.hospital.queue.entity.Token;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private Token.TokenStatus status;
}