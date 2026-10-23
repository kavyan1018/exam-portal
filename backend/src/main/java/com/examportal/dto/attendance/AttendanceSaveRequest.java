package com.examportal.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class AttendanceSaveRequest {

    @NotBlank(message = "Batch name is required")
    private String batchName;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotBlank(message = "Session language is required")
    private String sessionLanguage; // e.g. "CSS", "HTML", "JavaScript", "Java", "Python"

    private String sessionTopic; // e.g. "Morning Session - CSS Grid"

    @NotNull(message = "Student records list cannot be null")
    private List<StudentStatusItem> records;

    public static class StudentStatusItem {
        private String studentName;
        private String studentEmail;
        private String status; // "PRESENT", "ABSENT", "LATE"
        private String remarks;

        public StudentStatusItem() {}

        public StudentStatusItem(String studentName, String studentEmail, String status, String remarks) {
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.status = status;
            this.remarks = remarks;
        }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public AttendanceSaveRequest() {}

    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getSessionLanguage() { return sessionLanguage; }
    public void setSessionLanguage(String sessionLanguage) { this.sessionLanguage = sessionLanguage; }

    public String getSessionTopic() { return sessionTopic; }
    public void setSessionTopic(String sessionTopic) { this.sessionTopic = sessionTopic; }

    public List<StudentStatusItem> getRecords() { return records; }
    public void setRecords(List<StudentStatusItem> records) { this.records = records; }
}
