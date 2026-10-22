package com.examportal.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_answers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"attempt_id", "question_id"})
})
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnore
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private Option selectedOption;

    private boolean isMarkedForReview = false;

    private LocalDateTime lastSavedAt = LocalDateTime.now();

    public StudentAnswer() {}

    public StudentAnswer(ExamAttempt attempt, Question question, Option selectedOption, boolean isMarkedForReview) {
        this.attempt = attempt;
        this.question = question;
        this.selectedOption = selectedOption;
        this.isMarkedForReview = isMarkedForReview;
        this.lastSavedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ExamAttempt getAttempt() { return attempt; }
    public void setAttempt(ExamAttempt attempt) { this.attempt = attempt; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }

    public Option getSelectedOption() { return selectedOption; }
    public void setSelectedOption(Option selectedOption) { this.selectedOption = selectedOption; }

    public boolean isMarkedForReview() { return isMarkedForReview; }
    public void setMarkedForReview(boolean markedForReview) { isMarkedForReview = markedForReview; }

    public LocalDateTime getLastSavedAt() { return lastSavedAt; }
    public void setLastSavedAt(LocalDateTime lastSavedAt) { this.lastSavedAt = lastSavedAt; }
}
