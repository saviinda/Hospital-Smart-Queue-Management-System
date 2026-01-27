package com.hospital.queue.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_number", unique = true, nullable = false)
    private String tokenNumber;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "doctor_id")
    private Long doctorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenStatus status = TokenStatus.WAITING;

    @Column(name = "booking_time")
    private LocalDateTime bookingTime = LocalDateTime.now();

    @Column(name = "estimated_wait_time")
    private Integer estimatedWaitTime; // in minutes

    @Column(name = "actual_wait_time")
    private Integer actualWaitTime; // in minutes

    @Column(name = "service_start_time")
    private LocalDateTime serviceStartTime;

    @Column(name = "service_end_time")
    private LocalDateTime serviceEndTime;

    private Integer priority = 0;

    public enum TokenStatus {
        WAITING, IN_PROGRESS, COMPLETED, CANCELLED
    }
}