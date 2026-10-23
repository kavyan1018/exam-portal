package com.examportal.service;

import com.examportal.dto.compiler.CompilerExecutionRequest;
import com.examportal.dto.compiler.CompilerExecutionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class CompilerService {

    private static final Logger log = LoggerFactory.getLogger(CompilerService.class);
    private static final String WANDBOX_API = "https://wandbox.org/api/compile.json";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public CompilerService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public CompilerExecutionResponse execute(CompilerExecutionRequest request) {
        long startTime = System.currentTimeMillis();
        String lang = request.getLanguage() != null ? request.getLanguage().trim().toLowerCase() : "javascript";
        String code = request.getCode() != null ? request.getCode() : "";
        String stdin = request.getStdin() != null ? request.getStdin() : "";

        // Client-centric languages
        if ("html".equals(lang) || "css".equals(lang)) {
            return new CompilerExecutionResponse(true, "Markup/Style verified successfully.", null, 0, 10L);
        }

        // Map to Wandbox compiler name
        String compilerName;
        String preparedCode = code;

        switch (lang) {
            case "c":
                compilerName = "gcc-head-c";
                break;
            case "cpp":
            case "c++":
                compilerName = "gcc-head";
                break;
            case "java":
                compilerName = "openjdk-jdk-22+36";
                // Replace "public class <Name>" with "class prog" to match Wandbox single-file runner requirement
                preparedCode = preparedCode.replaceFirst("public\\s+class\\s+([A-Za-z0-9_]+)", "class prog");
                break;
            case "python":
            case "py":
                compilerName = "cpython-3.12.7";
                break;
            case "dsa":
                // DSA fallback: detect language or default to C++ / Python
                if (preparedCode.contains("#include")) {
                    compilerName = "gcc-head";
                } else if (preparedCode.contains("class Solution") && preparedCode.contains("public static void")) {
                    compilerName = "openjdk-jdk-22+36";
                    preparedCode = preparedCode.replaceFirst("public\\s+class\\s+([A-Za-z0-9_]+)", "class prog");
                } else if (preparedCode.contains("def ") || preparedCode.contains("print(")) {
                    compilerName = "cpython-3.12.7";
                } else {
                    compilerName = "gcc-head";
                }
                break;
            case "javascript":
            case "js":
                // Node.js on Wandbox
                compilerName = "nodejs-head";
                break;
            default:
                compilerName = "cpython-3.12.7";
                break;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("compiler", compilerName);
            payload.put("code", preparedCode);
            payload.put("stdin", stdin);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(WANDBOX_API))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            long executionTime = System.currentTimeMillis() - startTime;

            if (httpResponse.statusCode() != 200) {
                log.warn("Wandbox compilation failed with HTTP {}: {}", httpResponse.statusCode(), httpResponse.body());
                return new CompilerExecutionResponse(false, null, "Execution service error (HTTP " + httpResponse.statusCode() + ")", 1, executionTime);
            }

            JsonNode root = objectMapper.readTree(httpResponse.body());
            int exitCode = root.has("status") && !root.get("status").isNull() ? root.get("status").asInt() : 0;
            String stdout = root.has("program_output") ? root.get("program_output").asText() : "";
            String compilerError = root.has("compiler_error") ? root.get("compiler_error").asText() : "";
            String runtimeError = root.has("program_error") ? root.get("program_error").asText() : "";

            StringBuilder combinedError = new StringBuilder();
            if (!compilerError.isBlank()) combinedError.append(compilerError).append("\n");
            if (!runtimeError.isBlank()) combinedError.append(runtimeError);

            String finalError = combinedError.toString().trim();
            boolean success = exitCode == 0 && finalError.isEmpty();

            return new CompilerExecutionResponse(
                    success,
                    stdout != null ? stdout : "",
                    finalError.isEmpty() ? null : finalError,
                    exitCode,
                    executionTime
            );

        } catch (Exception e) {
            log.error("Execution error for language {}: {}", lang, e.getMessage());
            long executionTime = System.currentTimeMillis() - startTime;
            return new CompilerExecutionResponse(false, null, "Execution timed out or failed: " + e.getMessage(), 1, executionTime);
        }
    }
}
