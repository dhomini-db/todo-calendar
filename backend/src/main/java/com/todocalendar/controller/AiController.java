package com.todocalendar.controller;

import com.todocalendar.dto.ai.AiChatRequest;
import com.todocalendar.dto.ai.AiChatResponse;
import com.todocalendar.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    /**
     * POST /api/ai/chat
     * Requires a valid JWT. auth.getName() returns the userId as String (set by JwtAuthFilter).
     */
    @PostMapping("/chat")
    public AiChatResponse chat(
            @RequestBody AiChatRequest request,
            Authentication auth
    ) {
        return aiService.chat(auth.getName(), request);
    }

    /**
     * GET /api/ai/status
     * Returns whether the AI is configured (has a valid API key).
     */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("configured", aiService.isConfigured());
    }
}
