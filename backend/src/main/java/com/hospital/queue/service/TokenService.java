package com.hospital.queue.service;

import com.hospital.queue.dto.TokenRequest;
import com.hospital.queue.dto.TokenResponse;
import com.hospital.queue.entity.Department;
import com.hospital.queue.entity.Token;
import com.hospital.queue.entity.User;
import com.hospital.queue.repository.DepartmentRepository;
import com.hospital.queue.repository.TokenRepository;
import com.hospital.queue.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final MLPredictionService mlPredictionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final QueueAnalyticsService analyticsService;

    @Transactional
    public TokenResponse createToken(TokenRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Token token = new Token();
        token.setUserId(request.getUserId());
        token.setDepartmentId(request.getDepartmentId());
        token.setDoctorId(request.getDoctorId());
        token.setPriority(request.getPriority());
        token.setTokenNumber(generateTokenNumber(request.getDepartmentId()));

        // Get ML prediction for wait time
        Integer estimatedWait = mlPredictionService.predictWaitTime(request.getDepartmentId());
        token.setEstimatedWaitTime(estimatedWait);

        Token savedToken = tokenRepository.save(token);

        // Broadcast to WebSocket
        TokenResponse response = mapToResponse(savedToken, user, department);
        messagingTemplate.convertAndSend(
                "/topic/queue/" + request.getDepartmentId(),
                response
        );

        return response;
    }

    public List<TokenResponse> getUserTokens(Long userId) {
        List<Token> tokens = tokenRepository.findByUserId(userId);
        return tokens.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TokenResponse> getDepartmentQueue(Long departmentId) {
        List<Token.TokenStatus> activeStatuses = List.of(
                Token.TokenStatus.WAITING,
                Token.TokenStatus.IN_PROGRESS
        );

        List<Token> tokens = tokenRepository
                .findByDepartmentIdAndStatusInOrderByPriorityDescBookingTimeAsc(
                        departmentId,
                        activeStatuses
                );

        return tokens.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TokenResponse updateTokenStatus(Long tokenId, Token.TokenStatus status) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        Token.TokenStatus oldStatus = token.getStatus();
        token.setStatus(status);

        if (status == Token.TokenStatus.IN_PROGRESS && oldStatus == Token.TokenStatus.WAITING) {
            token.setServiceStartTime(LocalDateTime.now());

            // Calculate actual wait time
            Duration waitDuration = Duration.between(token.getBookingTime(), LocalDateTime.now());
            token.setActualWaitTime((int) waitDuration.toMinutes());
        } else if (status == Token.TokenStatus.COMPLETED) {
            token.setServiceEndTime(LocalDateTime.now());

            // If service start time exists, calculate service duration
            if (token.getServiceStartTime() != null) {
                Duration serviceDuration = Duration.between(
                        token.getServiceStartTime(),
                        LocalDateTime.now()
                );

                // Update analytics
                analyticsService.recordTokenCompletion(token, (int) serviceDuration.toMinutes());
            }
        }

        Token updated = tokenRepository.save(token);
        TokenResponse response = mapToResponse(updated);

        // Broadcast update
        messagingTemplate.convertAndSend(
                "/topic/queue/" + token.getDepartmentId(),
                response
        );

        return response;
    }

    private String generateTokenNumber(Long departmentId) {
        String prefix = "D" + departmentId;
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 1000);
        return String.format("%s-%s-%03d", prefix, timestamp, random);
    }

    private TokenResponse mapToResponse(Token token) {
        User user = userRepository.findById(token.getUserId()).orElse(null);
        Department department = departmentRepository.findById(token.getDepartmentId()).orElse(null);
        return mapToResponse(token, user, department);
    }

    private TokenResponse mapToResponse(Token token, User user, Department department) {
        // Calculate queue position
        Long queuePosition = tokenRepository.countByDepartmentIdAndStatus(
                token.getDepartmentId(),
                Token.TokenStatus.WAITING
        );

        return new TokenResponse(
                token.getId(),
                token.getTokenNumber(),
                token.getUserId(),
                user != null ? user.getFullName() : "Unknown",
                token.getDepartmentId(),
                department != null ? department.getName() : "Unknown",
                token.getStatus(),
                token.getBookingTime(),
                token.getEstimatedWaitTime(),
                queuePosition.intValue(),
                token.getServiceStartTime(),
                token.getServiceEndTime()
        );
    }
}