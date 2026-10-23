package com.examportal.dto.attempt;

import java.math.BigDecimal;

public class QuestionEvaluationDto {

    private Long questionId;
    private int questionOrder;
    private String questionText;
    private String section;
    private BigDecimal maxMarks;
    private BigDecimal marksAwarded;
    private String studentSelectedOption;
    private String studentAnswer;
    private String codeLanguage;
    private String correctOptionText;
    private String expectedExplanation;
    private String aiFeedback;
    private boolean evaluated;

    public QuestionEvaluationDto() {}

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public int getQuestionOrder() { return questionOrder; }
    public void setQuestionOrder(int questionOrder) { this.questionOrder = questionOrder; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public BigDecimal getMaxMarks() { return maxMarks; }
    public void setMaxMarks(BigDecimal maxMarks) { this.maxMarks = maxMarks; }

    public BigDecimal getMarksAwarded() { return marksAwarded; }
    public void setMarksAwarded(BigDecimal marksAwarded) { this.marksAwarded = marksAwarded; }

    public String getStudentSelectedOption() { return studentSelectedOption; }
    public void setStudentSelectedOption(String studentSelectedOption) { this.studentSelectedOption = studentSelectedOption; }

    public String getStudentAnswer() { return studentAnswer; }
    public void setStudentAnswer(String studentAnswer) { this.studentAnswer = studentAnswer; }

    public String getCodeLanguage() { return codeLanguage; }
    public void setCodeLanguage(String codeLanguage) { this.codeLanguage = codeLanguage; }

    public String getCorrectOptionText() { return correctOptionText; }
    public void setCorrectOptionText(String correctOptionText) { this.correctOptionText = correctOptionText; }

    public String getExpectedExplanation() { return expectedExplanation; }
    public void setExpectedExplanation(String expectedExplanation) { this.expectedExplanation = expectedExplanation; }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }

    public boolean isEvaluated() { return evaluated; }
    public void setEvaluated(boolean evaluated) { this.evaluated = evaluated; }
}
