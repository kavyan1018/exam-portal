package com.examportal.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proctoring_logs")
public class ProctoringLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnore
    private ExamAttempt attempt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProctoringEventType eventType;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String snapshotPath;

    private LocalDateTime loggedAt = LocalDateTime.now();

    public ProctoringLog() {}

    public ProctoringLog(ExamAttempt attempt, ProctoringEventType eventType, String details, String snapshotPath) {
        this.attempt = attempt;
        this.eventType = eventType;
        this.details = details;
        this.snapshotPath = snapshotPath;
        this.loggedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ExamAttempt getAttempt() { return attempt; }
    public void setAttempt(ExamAttempt attempt) { this.attempt = attempt; }

    public ProctoringEventType getEventType() { return eventType; }
    public void setEventType(ProctoringEventType eventType) { this.eventType = eventType; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getSnapshotPath() { return snapshotPath; }
    public void setSnapshotPath(String snapshotPath) { this.snapshotPath = snapshotPath; }

    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
}
