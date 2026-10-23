package com.examportal.dto.attempt;

import com.examportal.dto.exam.QuestionDto;
import com.examportal.model.AttemptStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class StartExamResponse {
    private Long attemptId;
    private Long examId;
    private String examTitle;
    private LocalDateTime startedAt;
    private LocalDateTime scheduledEndAt;
    private long remainingSeconds;
    private int maxViolationsAllowed;
    private boolean enableWebcam;
    private AttemptStatus status;
    private List<QuestionDto> questions;
    private Map<Long, Long> existingAnswers; // questionId -> selectedOptionId
    private Map<Long, String> existingTextAnswers; // questionId -> textAnswer / code
    private Map<Long, String> existingCodeLanguages; // questionId -> codeLanguage
    private Map<Long, Boolean> reviewFlags;   // questionId -> isMarkedForReview

    public StartExamResponse() {}

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getScheduledEndAt() { return scheduledEndAt; }
    public void setScheduledEndAt(LocalDateTime scheduledEndAt) { this.scheduledEndAt = scheduledEndAt; }

    public long getRemainingSeconds() { return remainingSeconds; }
    public void setRemainingSeconds(long remainingSeconds) { this.remainingSeconds = remainingSeconds; }

    public int getMaxViolationsAllowed() { return maxViolationsAllowed; }
    public void setMaxViolationsAllowed(int maxViolationsAllowed) { this.maxViolationsAllowed = maxViolationsAllowed; }

    public boolean isEnableWebcam() { return enableWebcam; }
    public void setEnableWebcam(boolean enableWebcam) { this.enableWebcam = enableWebcam; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }

    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }

    public Map<Long, Long> getExistingAnswers() { return existingAnswers; }
    public void setExistingAnswers(Map<Long, Long> existingAnswers) { this.existingAnswers = existingAnswers; }

    public Map<Long, String> getExistingTextAnswers() { return existingTextAnswers; }
    public void setExistingTextAnswers(Map<Long, String> existingTextAnswers) { this.existingTextAnswers = existingTextAnswers; }

    public Map<Long, String> getExistingCodeLanguages() { return existingCodeLanguages; }
    public void setExistingCodeLanguages(Map<Long, String> existingCodeLanguages) { this.existingCodeLanguages = existingCodeLanguages; }

    public Map<Long, Boolean> getReviewFlags() { return reviewFlags; }
    public void setReviewFlags(Map<Long, Boolean> reviewFlags) { this.reviewFlags = reviewFlags; }
}
