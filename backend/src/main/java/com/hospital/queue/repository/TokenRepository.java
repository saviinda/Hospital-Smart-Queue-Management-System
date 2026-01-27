package com.hospital.queue.repository;

import com.hospital.queue.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    List<Token> findByUserId(Long userId);

    List<Token> findByDepartmentIdAndStatusOrderByBookingTimeAsc(
            Long departmentId,
            Token.TokenStatus status
    );

    List<Token> findByDepartmentIdAndStatusInOrderByPriorityDescBookingTimeAsc(
            Long departmentId,
            List<Token.TokenStatus> statuses
    );

    @Query("SELECT COUNT(t) FROM Token t WHERE t.departmentId = :departmentId " +
            "AND t.status = :status")
    Long countByDepartmentIdAndStatus(Long departmentId, Token.TokenStatus status);

    @Query("SELECT t FROM Token t WHERE t.departmentId = :departmentId " +
            "AND t.bookingTime BETWEEN :startDate AND :endDate " +
            "AND t.status = 'COMPLETED' ORDER BY t.bookingTime DESC")
    List<Token> findCompletedTokensByDepartmentAndDateRange(
            Long departmentId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    @Query("SELECT AVG(t.actualWaitTime) FROM Token t WHERE t.departmentId = :departmentId " +
            "AND t.status = 'COMPLETED' AND t.actualWaitTime IS NOT NULL")
    Double getAverageWaitTimeByDepartment(Long departmentId);
}