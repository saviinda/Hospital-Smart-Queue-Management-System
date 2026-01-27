package com.hospital.queue.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "queue_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueueAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer hour;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "tokens_count")
    private Integer tokensCount = 0;

    @Column(name = "average_wait_time", precision = 10, scale = 2)
    private BigDecimal averageWaitTime;

    @Column(name = "average_service_time", precision = 10, scale = 2)
    private BigDecimal averageServiceTime;
}