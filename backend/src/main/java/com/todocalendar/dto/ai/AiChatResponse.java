package com.todocalendar.dto.ai;

public record AiChatResponse(String response, boolean success, String error) {

    public static AiChatResponse ok(String response) {
        return new AiChatResponse(response, true, null);
    }

    public static AiChatResponse error(String error) {
        return new AiChatResponse(null, false, error);
    }
}
