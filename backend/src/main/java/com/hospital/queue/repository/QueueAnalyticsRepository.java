package com.hospital.queue.repository;

import com.hospital.queue.entity.QueueAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueAnalyticsRepository extends JpaRepository<QueueAnalytics, Long> {

    Optional<QueueAnalytics> findByDepartmentIdAndDateAndHour(
            Long departmentId,
            LocalDate date,
            Integer hour
    );

    List<QueueAnalytics> findByDepartmentIdAndDateBetween(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    );
}