package com.examportal.dto.compiler;

public class CompilerExecutionResponse {

    private boolean success;
    private String output;
    private String error;
    private Integer exitCode;
    private Long executionTimeMs;

    public CompilerExecutionResponse() {}

    public CompilerExecutionResponse(boolean success, String output, String error, Integer exitCode, Long executionTimeMs) {
        this.success = success;
        this.output = output;
        this.error = error;
        this.exitCode = exitCode;
        this.executionTimeMs = executionTimeMs;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public Integer getExitCode() { return exitCode; }
    public void setExitCode(Integer exitCode) { this.exitCode = exitCode; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
}
