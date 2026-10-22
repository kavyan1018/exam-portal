package com.examportal.service;

import com.examportal.dto.attempt.LogEventRequest;
import com.examportal.model.AttemptStatus;
import com.examportal.model.Exam;
import com.examportal.model.ExamAttempt;
import com.examportal.model.ProctoringLog;
import com.examportal.repository.ExamAttemptRepository;
import com.examportal.repository.ProctoringLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class ProctoringService {

    private static final Logger logger = LoggerFactory.getLogger(ProctoringService.class);

    @Autowired
    private ProctoringLogRepository proctoringLogRepository;

    @Autowired
    private ExamAttemptRepository attemptRepository;

    @Autowired
    private ExamTakingService examTakingService;

    @Value("${app.upload.dir:./uploads/snapshots}")
    private String uploadDir;

    @Transactional
    public void recordEvent(Long attemptId, Long userId, LogEventRequest request) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized attempt modification");
        }

        String savedImagePath = null;
        if (request.getSnapshotBase64() != null && !request.getSnapshotBase64().isBlank()) {
            savedImagePath = saveSnapshot(attemptId, request.getSnapshotBase64());
        }

        ProctoringLog log = new ProctoringLog(
                attempt,
                request.getEventType(),
                request.getDetails(),
                savedImagePath
        );
        proctoringLogRepository.save(log);

        // Check if event is a violation
        Exam exam = attempt.getExam();
        boolean isViolation = switch (request.getEventType()) {
            case FULLSCREEN_EXIT, TAB_SWITCH, WINDOW_BLUR, DEVTOOLS_ATTEMPT -> true;
            default -> false;
        };

        if (isViolation && attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            int newCount = attempt.getViolationCount() + 1;
            attempt.setViolationCount(newCount);

            logger.warn("Student violation recorded: Attempt={}, User={}, Violations={}/{}",
                    attemptId, userId, newCount, exam.getMaxViolationsAllowed());

            if (newCount >= exam.getMaxViolationsAllowed()) {
                logger.error("Attempt {} exceeded max allowed violations ({}). Disqualifying.", attemptId, exam.getMaxViolationsAllowed());
                examTakingService.submitExam(attemptId, userId, AttemptStatus.DISQUALIFIED);
            } else {
                attemptRepository.save(attempt);
            }
        }
    }

    public List<ProctoringLog> getLogsForAttempt(Long attemptId) {
        return proctoringLogRepository.findByAttemptIdOrderByLoggedAtDesc(attemptId);
    }

    private String saveSnapshot(Long attemptId, String base64Data) {
        try {
            Files.createDirectories(Paths.get(uploadDir));
            String cleanBase64 = base64Data;
            if (cleanBase64.contains(",")) {
                cleanBase64 = cleanBase64.split(",")[1];
            }

            byte[] decoded = Base64.getDecoder().decode(cleanBase64);
            String filename = "snapshot_" + attemptId + "_" + System.currentTimeMillis() + ".jpg";
            File targetFile = new File(uploadDir, filename);

            try (FileOutputStream fos = new FileOutputStream(targetFile)) {
                fos.write(decoded);
            }
            return "/uploads/snapshots/" + filename;
        } catch (IOException | IllegalArgumentException e) {
            logger.error("Failed to save proctoring snapshot: {}", e.getMessage());
            return null;
        }
    }
}
