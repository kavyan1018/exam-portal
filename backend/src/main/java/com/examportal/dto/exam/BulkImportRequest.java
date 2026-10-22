package com.examportal.dto.exam;

import java.util.List;

public class BulkImportRequest {
    private String rawText;
    private List<QuestionDto> parsedQuestions;

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public List<QuestionDto> getParsedQuestions() { return parsedQuestions; }
    public void setParsedQuestions(List<QuestionDto> parsedQuestions) { this.parsedQuestions = parsedQuestions; }
}
