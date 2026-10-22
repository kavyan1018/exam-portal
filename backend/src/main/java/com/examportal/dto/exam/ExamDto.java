package com.examportal.dto.exam;

import com.examportal.model.ExamStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ExamDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startWindow;
    private LocalDateTime endWindow;
    private Integer durationMinutes;
    private BigDecimal totalMarks;
    private BigDecimal passMarks;
    private BigDecimal negativeMarkPerQuestion;
    private boolean randomizeQuestions;
    private boolean randomizeOptions;
    private int maxViolationsAllowed;
    private boolean enableWebcam;
    private ExamStatus status;
    private String createdByName;
    private int questionCount;
    private List<QuestionDto> questions;

    public ExamDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartWindow() { return startWindow; }
    public void setStartWindow(LocalDateTime startWindow) { this.startWindow = startWindow; }

    public LocalDateTime getEndWindow() { return endWindow; }
    public void setEndWindow(LocalDateTime endWindow) { this.endWindow = endWindow; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getTotalMarks() { return totalMarks; }
    public void setTotalMarks(BigDecimal totalMarks) { this.totalMarks = totalMarks; }

    public BigDecimal getPassMarks() { return passMarks; }
    public void setPassMarks(BigDecimal passMarks) { this.passMarks = passMarks; }

    public BigDecimal getNegativeMarkPerQuestion() { return negativeMarkPerQuestion; }
    public void setNegativeMarkPerQuestion(BigDecimal negativeMarkPerQuestion) { this.negativeMarkPerQuestion = negativeMarkPerQuestion; }

    public boolean isRandomizeQuestions() { return randomizeQuestions; }
    public void setRandomizeQuestions(boolean randomizeQuestions) { this.randomizeQuestions = randomizeQuestions; }

    public boolean isRandomizeOptions() { return randomizeOptions; }
    public void setRandomizeOptions(boolean randomizeOptions) { this.randomizeOptions = randomizeOptions; }

    public int getMaxViolationsAllowed() { return maxViolationsAllowed; }
    public void setMaxViolationsAllowed(int maxViolationsAllowed) { this.maxViolationsAllowed = maxViolationsAllowed; }

    public boolean isEnableWebcam() { return enableWebcam; }
    public void setEnableWebcam(boolean enableWebcam) { this.enableWebcam = enableWebcam; }

    public ExamStatus getStatus() { return status; }
    public void setStatus(ExamStatus status) { this.status = status; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }

    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }
}
