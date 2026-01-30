package com.hospital.queue.service;

import com.hospital.queue.dto.TokenResponse;
import com.hospital.queue.entity.Token;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast token update to all subscribers of a specific department queue
     */
    public void broadcastTokenUpdate(Long departmentId, TokenResponse tokenResponse) {
        String destination = "/topic/queue/" + departmentId;
        log.info("Broadcasting token update to {}: {}", destination, tokenResponse.getTokenNumber());
        messagingTemplate.convertAndSend(destination, tokenResponse);
    }

    /**
     * Broadcast queue statistics update
     */
    public void broadcastQueueStats(Long departmentId, Map<String, Object> stats) {
        String destination = "/topic/queue/" + departmentId + "/stats";
        log.info("Broadcasting queue stats to {}", destination);
        messagingTemplate.convertAndSend(destination, (Object) stats);
    }

    /**
     * Send notification to specific user
     */
    public void sendUserNotification(Long userId, String message, String type) {
        String destination = "/queue/user/" + userId + "/notifications";

        Map<String, Object> notification = new HashMap<>();
        notification.put("message", message);
        notification.put("type", type);
        notification.put("timestamp", System.currentTimeMillis());

        log.info("Sending notification to user {}: {}", userId, message);
        messagingTemplate.convertAndSend(destination, (Object) notification);
    }

    /**
     * Broadcast token status change to department queue
     */
    public void broadcastStatusChange(Long departmentId, Long tokenId, Token.TokenStatus oldStatus, Token.TokenStatus newStatus) {
        String destination = "/topic/queue/" + departmentId + "/status";

        Map<String, Object> statusChange = new HashMap<>();
        statusChange.put("tokenId", tokenId);
        statusChange.put("oldStatus", oldStatus);
        statusChange.put("newStatus", newStatus);
        statusChange.put("timestamp", System.currentTimeMillis());

        log.info("Broadcasting status change for token {} from {} to {}",
                tokenId, oldStatus, newStatus);
        messagingTemplate.convertAndSend(destination, (Object) statusChange);
    }

    /**
     * Broadcast new token creation to department
     */
    public void broadcastNewToken(Long departmentId, TokenResponse tokenResponse) {
        String destination = "/topic/queue/" + departmentId + "/new";
        log.info("Broadcasting new token to {}: {}", destination, tokenResponse.getTokenNumber());
        messagingTemplate.convertAndSend(destination, tokenResponse);
    }

    /**
     * Broadcast token cancellation
     */
    public void broadcastTokenCancellation(Long departmentId, Long tokenId, String tokenNumber) {
        String destination = "/topic/queue/" + departmentId + "/cancelled";

        Map<String, Object> cancellation = new HashMap<>();
        cancellation.put("tokenId", tokenId);
        cancellation.put("tokenNumber", tokenNumber);
        cancellation.put("timestamp", System.currentTimeMillis());

        log.info("Broadcasting token cancellation: {}", tokenNumber);
        messagingTemplate.convertAndSend(destination, (Object) cancellation);
    }

    /**
     * Broadcast live display update for hospital screens
     */
    public void broadcastLiveDisplayUpdate(Long departmentId, Object displayData) {
        String destination = "/topic/display/" + departmentId;
        log.info("Broadcasting live display update to {}", destination);
        messagingTemplate.convertAndSend(destination, displayData);
    }

    /**
     * Send alert to all admins
     */
    public void sendAdminAlert(String message, String severity) {
        String destination = "/topic/admin/alerts";

        Map<String, Object> alert = new HashMap<>();
        alert.put("message", message);
        alert.put("severity", severity);
        alert.put("timestamp", System.currentTimeMillis());

        log.info("Sending admin alert: {} ({})", message, severity);
        messagingTemplate.convertAndSend(destination, (Object) alert);
    }

    /**
     * Broadcast wait time update after ML prediction
     */
    public void broadcastWaitTimeUpdate(Long departmentId, Integer estimatedWaitTime, Integer queueLength) {
        String destination = "/topic/queue/" + departmentId + "/waittime";

        Map<String, Object> waitTimeUpdate = new HashMap<>();
        waitTimeUpdate.put("estimatedWaitTime", estimatedWaitTime);
        waitTimeUpdate.put("queueLength", queueLength);
        waitTimeUpdate.put("timestamp", System.currentTimeMillis());

        log.info("Broadcasting wait time update: {} min for {} people",
                estimatedWaitTime, queueLength);
        messagingTemplate.convertAndSend(destination, (Object) waitTimeUpdate);
    }

    /**
     * Send token call notification - when it's user's turn
     */
    public void sendTokenCallNotification(Long userId, String tokenNumber, String departmentName) {
        String destination = "/queue/user/" + userId + "/call";

        Map<String, Object> callNotification = new HashMap<>();
        callNotification.put("tokenNumber", tokenNumber);
        callNotification.put("departmentName", departmentName);
        callNotification.put("message", "Your turn! Please proceed to " + departmentName);
        callNotification.put("timestamp", System.currentTimeMillis());

        log.info("Sending call notification to user {}: {}", userId, tokenNumber);
        messagingTemplate.convertAndSend(destination, (Object) callNotification);
    }
}