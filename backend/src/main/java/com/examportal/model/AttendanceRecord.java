package com.examportal.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", indexes = {
    @Index(name = "idx_batch_date_lang", columnList = "batchName, attendanceDate, sessionLanguage")
})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String batchName;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private String sessionLanguage; // e.g. "CSS", "HTML", "JavaScript", "Java", "Python"

    private String sessionTopic; // e.g. "Morning Session", "CSS Keyframes & Layout"

    @Column(nullable = false)
    private String studentName;

    private String studentEmail;

    @Column(nullable = false)
    private String status = "PRESENT"; // "PRESENT", "ABSENT", "LATE"

    private String remarks;

    private String markedBy;

    private LocalDateTime markedAt = LocalDateTime.now();

    public AttendanceRecord() {}

    public AttendanceRecord(String batchName, LocalDate attendanceDate, String sessionLanguage, String sessionTopic,
                            String studentName, String studentEmail, String status, String remarks, String markedBy) {
        this.batchName = batchName;
        this.attendanceDate = attendanceDate;
        this.sessionLanguage = sessionLanguage;
        this.sessionTopic = sessionTopic;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.status = status != null ? status.toUpperCase() : "PRESENT";
        this.remarks = remarks;
        this.markedBy = markedBy;
        this.markedAt = LocalDateTime.now();
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
    public void setStatus(String status) { this.status = status != null ? status.toUpperCase() : "PRESENT"; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getMarkedBy() { return markedBy; }
    public void setMarkedBy(String markedBy) { this.markedBy = markedBy; }

    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }
}
