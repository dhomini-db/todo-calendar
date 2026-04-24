package com.todocalendar.dto.ai;

import java.util.List;

public record AiChatRequest(
        String message,
        List<ChatMessage> history
) {
    public record ChatMessage(String role, String content) {}
}
