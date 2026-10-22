package com.examportal.dto.attempt;

public class HeartbeatRequest {
    private boolean isFullscreen;
    private boolean isFocused;

    public boolean isFullscreen() { return isFullscreen; }
    public void setFullscreen(boolean fullscreen) { isFullscreen = fullscreen; }

    public boolean isFocused() { return isFocused; }
    public void setFocused(boolean focused) { isFocused = focused; }
}
