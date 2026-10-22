package com.examportal.dto.exam;

import com.examportal.model.ExamStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ExamCreateRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime startWindow;

    @NotNull
    private LocalDateTime endWindow;

    @NotNull
    @Min(1)
    private Integer durationMinutes;

    private BigDecimal totalMarks = BigDecimal.ZERO;

    private BigDecimal passMarks = BigDecimal.ZERO;

    private BigDecimal negativeMarkPerQuestion = BigDecimal.ZERO;

    private boolean randomizeQuestions = true;

    private boolean randomizeOptions = true;

    private int maxViolationsAllowed = 3;

    private boolean enableWebcam = true;

    private ExamStatus status = ExamStatus.DRAFT;

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
}
