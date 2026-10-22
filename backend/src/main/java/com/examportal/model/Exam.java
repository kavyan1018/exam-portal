package com.examportal.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime startWindow;

    @Column(nullable = false)
    private LocalDateTime endWindow;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private BigDecimal totalMarks = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal passMarks = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal negativeMarkPerQuestion = BigDecimal.ZERO;

    private boolean randomizeQuestions = true;

    private boolean randomizeOptions = true;

    private int maxViolationsAllowed = 3;

    private boolean enableWebcam = true;

    private boolean isLocked = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamStatus status = ExamStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User createdBy;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionOrder ASC")
    private List<Question> questions = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    public Exam() {}

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

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }

    public ExamStatus getStatus() { return status; }
    public void setStatus(ExamStatus status) { this.status = status; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
