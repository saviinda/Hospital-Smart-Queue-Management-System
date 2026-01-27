package com.hospital.queue.service;

import com.hospital.queue.entity.QueueAnalytics;
import com.hospital.queue.entity.Token;
import com.hospital.queue.repository.QueueAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class QueueAnalyticsService {

    private final QueueAnalyticsRepository analyticsRepository;

    @Transactional
    public void recordTokenCompletion(Token token, int serviceDuration) {
        LocalDateTime bookingTime = token.getBookingTime();
        LocalDate date = bookingTime.toLocalDate();
        int hour = bookingTime.getHour();
        int dayOfWeek = bookingTime.getDayOfWeek().getValue();

        QueueAnalytics analytics = analyticsRepository
                .findByDepartmentIdAndDateAndHour(token.getDepartmentId(), date, hour)
                .orElse(new QueueAnalytics());

        analytics.setDepartmentId(token.getDepartmentId());
        analytics.setDate(date);
        analytics.setHour(hour);
        analytics.setDayOfWeek(dayOfWeek);

        // Update counts and averages
        int currentCount = analytics.getTokensCount() != null ? analytics.getTokensCount() : 0;
        analytics.setTokensCount(currentCount + 1);

        // Update average wait time
        if (token.getActualWaitTime() != null) {
            BigDecimal currentAvg = analytics.getAverageWaitTime() != null
                    ? analytics.getAverageWaitTime()
                    : BigDecimal.ZERO;

            BigDecimal newAvg = currentAvg.multiply(BigDecimal.valueOf(currentCount))
                    .add(BigDecimal.valueOf(token.getActualWaitTime()))
                    .divide(BigDecimal.valueOf(currentCount + 1), 2, BigDecimal.ROUND_HALF_UP);

            analytics.setAverageWaitTime(newAvg);
        }

        // Update average service time
        BigDecimal currentServiceAvg = analytics.getAverageServiceTime() != null
                ? analytics.getAverageServiceTime()
                : BigDecimal.ZERO;

        BigDecimal newServiceAvg = currentServiceAvg.multiply(BigDecimal.valueOf(currentCount))
                .add(BigDecimal.valueOf(serviceDuration))
                .divide(BigDecimal.valueOf(currentCount + 1), 2, BigDecimal.ROUND_HALF_UP);

        analytics.setAverageServiceTime(newServiceAvg);

        analyticsRepository.save(analytics);
    }
}