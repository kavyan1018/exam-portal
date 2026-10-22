package com.examportal.dto.exam;

public class OptionDto {
    private Long id;
    private String optionText;
    private Boolean isCorrect;
    private int optionOrder;

    public OptionDto() {}

    public OptionDto(Long id, String optionText, Boolean isCorrect, int optionOrder) {
        this.id = id;
        this.optionText = optionText;
        this.isCorrect = isCorrect;
        this.optionOrder = optionOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }

    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean correct) { isCorrect = correct; }

    public int getOptionOrder() { return optionOrder; }
    public void setOptionOrder(int optionOrder) { this.optionOrder = optionOrder; }
}
