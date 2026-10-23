package com.examportal.dto.attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceSessionSummaryDto {
    private String batchName;
    private LocalDate attendanceDate;
    private String sessionLanguage;
    private String sessionTopic;
    private int totalStudents;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private double attendanceRate; // e.g. 92.5 %
    private String markedBy;
    private LocalDateTime markedAt;

    public AttendanceSessionSummaryDto() {}

    public AttendanceSessionSummaryDto(String batchName, LocalDate attendanceDate, String sessionLanguage,
                                      String sessionTopic, int totalStudents, int presentCount,
                                      int absentCount, int lateCount, String markedBy, LocalDateTime markedAt) {
        this.batchName = batchName;
        this.attendanceDate = attendanceDate;
        this.sessionLanguage = sessionLanguage;
        this.sessionTopic = sessionTopic;
        this.totalStudents = totalStudents;
        this.presentCount = presentCount;
        this.absentCount = absentCount;
        this.lateCount = lateCount;
        this.attendanceRate = totalStudents > 0 ? Math.round(((double) presentCount / totalStudents) * 1000.0) / 10.0 : 0.0;
        this.markedBy = markedBy;
        this.markedAt = markedAt;
    }

    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getSessionLanguage() { return sessionLanguage; }
    public void setSessionLanguage(String sessionLanguage) { this.sessionLanguage = sessionLanguage; }

    public String getSessionTopic() { return sessionTopic; }
    public void setSessionTopic(String sessionTopic) { this.sessionTopic = sessionTopic; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getPresentCount() { return presentCount; }
    public void setPresentCount(int presentCount) { this.presentCount = presentCount; }

    public int getAbsentCount() { return absentCount; }
    public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }

    public int getLateCount() { return lateCount; }
    public void setLateCount(int lateCount) { this.lateCount = lateCount; }

    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public String getMarkedBy() { return markedBy; }
    public void setMarkedBy(String markedBy) { this.markedBy = markedBy; }

    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }
}
