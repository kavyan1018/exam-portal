package com.examportal.dto.attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceRecordDto {
    private Long id;
    private String batchName;
    private LocalDate attendanceDate;
    private String sessionLanguage;
    private String sessionTopic;
    private String studentName;
    private String studentEmail;
    private String status;
    private String remarks;
    private String markedBy;
    private LocalDateTime markedAt;

    public AttendanceRecordDto() {}

    public AttendanceRecordDto(Long id, String batchName, LocalDate attendanceDate, String sessionLanguage,
                               String sessionTopic, String studentName, String studentEmail, String status,
                               String remarks, String markedBy, LocalDateTime markedAt) {
        this.id = id;
        this.batchName = batchName;
        this.attendanceDate = attendanceDate;
        this.sessionLanguage = sessionLanguage;
        this.sessionTopic = sessionTopic;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.status = status;
        this.remarks = remarks;
        this.markedBy = markedBy;
        this.markedAt = markedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getSessionLanguage() { return sessionLanguage; }
    public void setSessionLanguage(String sessionLanguage) { this.sessionLanguage = sessionLanguage; }

    public String getSessionTopic() { return sessionTopic; }
    public void setSessionTopic(String sessionTopic) { this.sessionTopic = sessionTopic; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getMarkedBy() { return markedBy; }
    public void setMarkedBy(String markedBy) { this.markedBy = markedBy; }

    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }
}
