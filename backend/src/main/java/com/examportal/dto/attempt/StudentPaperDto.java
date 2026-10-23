package com.examportal.dto.attempt;

import com.examportal.model.AttemptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class StudentPaperDto {

    private Long attemptId;
    private Long examId;
    private String examTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String rollNumber;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private AttemptStatus status;
    private BigDecimal score;
    private BigDecimal totalMarks;
    private BigDecimal passMarks;
    private boolean isPassed;
    private boolean isResultPublished;
    private boolean isAiEvaluated;
    private int violationCount;
    private List<QuestionEvaluationDto> questions = new ArrayList<>();

    public StudentPaperDto() {}

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public BigDecimal getTotalMarks() { return totalMarks; }
    public void setTotalMarks(BigDecimal totalMarks) { this.totalMarks = totalMarks; }

    public BigDecimal getPassMarks() { return passMarks; }
    public void setPassMarks(BigDecimal passMarks) { this.passMarks = passMarks; }

    public boolean isPassed() { return isPassed; }
    public void setPassed(boolean passed) { isPassed = passed; }

    public boolean isResultPublished() { return isResultPublished; }
    public void setResultPublished(boolean isResultPublished) { this.isResultPublished = isResultPublished; }

    public boolean isAiEvaluated() { return isAiEvaluated; }
    public void setAiEvaluated(boolean isAiEvaluated) { this.isAiEvaluated = isAiEvaluated; }

    public int getViolationCount() { return violationCount; }
    public void setViolationCount(int violationCount) { this.violationCount = violationCount; }

    public List<QuestionEvaluationDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionEvaluationDto> questions) { this.questions = questions; }
}
