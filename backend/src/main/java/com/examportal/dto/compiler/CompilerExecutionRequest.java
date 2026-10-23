package com.examportal.dto.compiler;

import jakarta.validation.constraints.NotBlank;

public class CompilerExecutionRequest {

    @NotBlank
    private String language;

    private String code;

    private String stdin;

    public CompilerExecutionRequest() {}

    public CompilerExecutionRequest(String language, String code, String stdin) {
        this.language = language;
        this.code = code;
        this.stdin = stdin;
    }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getStdin() { return stdin; }
    public void setStdin(String stdin) { this.stdin = stdin; }
}
