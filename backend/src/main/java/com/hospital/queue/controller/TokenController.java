package com.hospital.queue.controller;

import com.hospital.queue.dto.StatusUpdateRequest;
import com.hospital.queue.dto.TokenRequest;
import com.hospital.queue.dto.TokenResponse;
import com.hospital.queue.service.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tokens")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;

    @PostMapping
    public ResponseEntity<TokenResponse> createToken(@Valid @RequestBody TokenRequest request) {
        TokenResponse response = tokenService.createToken(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TokenResponse>> getUserTokens(@PathVariable Long userId) {
        List<TokenResponse> tokens = tokenService.getUserTokens(userId);
        return ResponseEntity.ok(tokens);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<TokenResponse>> getDepartmentQueue(@PathVariable Long departmentId) {
        List<TokenResponse> queue = tokenService.getDepartmentQueue(departmentId);
        return ResponseEntity.ok(queue);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TokenResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        TokenResponse response = tokenService.updateTokenStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }
}