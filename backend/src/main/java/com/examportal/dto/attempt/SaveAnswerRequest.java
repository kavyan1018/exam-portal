package com.examportal.dto.attempt;

import jakarta.validation.constraints.NotNull;

public class SaveAnswerRequest {
    @NotNull
    private Long questionId;

    private Long selectedOptionId; // nullable if cleared

    private boolean isMarkedForReview;

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public Long getSelectedOptionId() { return selectedOptionId; }
    public void setSelectedOptionId(Long selectedOptionId) { this.selectedOptionId = selectedOptionId; }

    public boolean isMarkedForReview() { return isMarkedForReview; }
    public void setMarkedForReview(boolean markedForReview) { isMarkedForReview = markedForReview; }
}
