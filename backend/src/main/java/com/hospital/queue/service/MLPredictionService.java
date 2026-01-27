package com.hospital.queue.service;

import com.hospital.queue.dto.WaitTimePredictionRequest;
import com.hospital.queue.dto.WaitTimePredictionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class MLPredictionService {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public Integer predictWaitTime(Long departmentId) {
        try {
            WaitTimePredictionRequest request = new WaitTimePredictionRequest(departmentId);

            WaitTimePredictionResponse response = webClientBuilder.build()
                    .post()
                    .uri(mlServiceUrl + "/predict")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(WaitTimePredictionResponse.class)
                    .block();

            return response != null ? response.getEstimatedWaitTime() : 25;
        } catch (Exception e) {
            System.err.println("ML prediction failed: " + e.getMessage());
            // Fallback to simple calculation
            return 25;
        }
    }
}