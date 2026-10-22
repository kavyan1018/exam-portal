package com.examportal.dto.attempt;

import com.examportal.model.AttemptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SubmitExamResponse {
    private Long attemptId;
    private AttemptStatus status;
    private String message;
    private LocalDateTime submittedAt;
    private BigDecimal score;
    private boolean isPassed;

    public SubmitExamResponse() {}

    public SubmitExamResponse(Long attemptId, AttemptStatus status, String message, LocalDateTime submittedAt, BigDecimal score, boolean isPassed) {
        this.attemptId = attemptId;
        this.status = status;
        this.message = message;
        this.submittedAt = submittedAt;
        this.score = score;
        this.isPassed = isPassed;
    }

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public boolean isPassed() { return isPassed; }
    public void setPassed(boolean passed) { isPassed = passed; }
}
