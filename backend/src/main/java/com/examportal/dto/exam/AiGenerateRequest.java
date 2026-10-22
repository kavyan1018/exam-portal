package com.examportal.dto.exam;

public class AiGenerateRequest {
    private String topic;
    private String languageOrSubject;
    private int count = 5;
    private String difficulty = "Medium";
    private String apiKey;

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getLanguageOrSubject() { return languageOrSubject; }
    public void setLanguageOrSubject(String languageOrSubject) { this.languageOrSubject = languageOrSubject; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
}
