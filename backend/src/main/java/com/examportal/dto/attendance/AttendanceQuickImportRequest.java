package com.examportal.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AttendanceQuickImportRequest {

    @NotBlank(message = "Batch name is required")
    private String batchName;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotBlank(message = "Session language is required")
    private String sessionLanguage; // e.g. "CSS", "HTML", "JavaScript", "Java", "Python"

    private String sessionTopic; // e.g. "Morning Session"

    @NotBlank(message = "Raw names text is required")
    private String rawText; // Multi-line or comma-separated list of student names

    private String defaultStatus = "PRESENT";

    private boolean markOthersAbsent = true;

    public AttendanceQuickImportRequest() {}

    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getSessionLanguage() { return sessionLanguage; }
    public void setSessionLanguage(String sessionLanguage) { this.sessionLanguage = sessionLanguage; }

    public String getSessionTopic() { return sessionTopic; }
    public void setSessionTopic(String sessionTopic) { this.sessionTopic = sessionTopic; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getDefaultStatus() { return defaultStatus; }
    public void setDefaultStatus(String defaultStatus) { this.defaultStatus = defaultStatus; }

    public boolean isMarkOthersAbsent() { return markOthersAbsent; }
    public void setMarkOthersAbsent(boolean markOthersAbsent) { this.markOthersAbsent = markOthersAbsent; }
}
