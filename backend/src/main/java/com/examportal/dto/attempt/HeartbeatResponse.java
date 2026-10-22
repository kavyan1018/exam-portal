package com.examportal.dto.attempt;

import com.examportal.model.AttemptStatus;

public class HeartbeatResponse {
    private long remainingSeconds;
    private AttemptStatus status;
    private int currentViolations;
    private boolean autoSubmitted;
    private String serverTime;

    public HeartbeatResponse() {}

    public HeartbeatResponse(long remainingSeconds, AttemptStatus status, int currentViolations, boolean autoSubmitted, String serverTime) {
        this.remainingSeconds = remainingSeconds;
        this.status = status;
        this.currentViolations = currentViolations;
        this.autoSubmitted = autoSubmitted;
        this.serverTime = serverTime;
    }

    public long getRemainingSeconds() { return remainingSeconds; }
    public void setRemainingSeconds(long remainingSeconds) { this.remainingSeconds = remainingSeconds; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }

    public int getCurrentViolations() { return currentViolations; }
    public void setCurrentViolations(int currentViolations) { this.currentViolations = currentViolations; }

    public boolean isAutoSubmitted() { return autoSubmitted; }
    public void setAutoSubmitted(boolean autoSubmitted) { this.autoSubmitted = autoSubmitted; }

    public String getServerTime() { return serverTime; }
    public void setServerTime(String serverTime) { this.serverTime = serverTime; }
}
