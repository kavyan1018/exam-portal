package com.examportal.dto.attempt;

import com.examportal.model.ProctoringEventType;
import jakarta.validation.constraints.NotNull;

public class LogEventRequest {
    @NotNull
    private ProctoringEventType eventType;

    private String details;

    private String snapshotBase64; // Optional base64 image data from webcam canvas

    public ProctoringEventType getEventType() { return eventType; }
    public void setEventType(ProctoringEventType eventType) { this.eventType = eventType; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getSnapshotBase64() { return snapshotBase64; }
    public void setSnapshotBase64(String snapshotBase64) { this.snapshotBase64 = snapshotBase64; }
}
