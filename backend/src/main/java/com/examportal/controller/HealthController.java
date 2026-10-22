package com.examportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> rootCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Secure MCQ Exam Portal Backend",
                "serverTime", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/api/v1/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Secure MCQ Exam Portal Backend",
                "serverTime", LocalDateTime.now().toString()
        ));
    }
}
