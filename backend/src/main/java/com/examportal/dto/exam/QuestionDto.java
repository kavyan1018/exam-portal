package com.examportal.dto.exam;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class QuestionDto {
    private Long id;
    private String questionText;
    private String explanation;
    private BigDecimal marks;
    private int questionOrder;
    private List<OptionDto> options = new ArrayList<>();

    public QuestionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public BigDecimal getMarks() { return marks; }
    public void setMarks(BigDecimal marks) { this.marks = marks; }

    public int getQuestionOrder() { return questionOrder; }
    public void setQuestionOrder(int questionOrder) { this.questionOrder = questionOrder; }

    public List<OptionDto> getOptions() { return options; }
    public void setOptions(List<OptionDto> options) { this.options = options; }
}
