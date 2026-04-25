package com.todocalendar.service;

import com.todocalendar.dto.ai.AiChatRequest;
import com.todocalendar.dto.ai.AiChatResponse;
import com.todocalendar.entity.Task;
import com.todocalendar.entity.User;
import com.todocalendar.repository.TaskRepository;
import com.todocalendar.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final RestTemplate restTemplate;

    @Value("${anthropic.api.key:}")
    private String apiKey;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL         = "claude-3-5-haiku-20241022";
    private static final int    MAX_TOKENS    = 1024;

    /** Returns true if the Anthropic API key is configured. */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Sends a chat message to the Anthropic Claude API with user context injected
     * as the system prompt, and returns the assistant's response.
     */
    public AiChatResponse chat(String userIdStr, AiChatRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return AiChatResponse.error("AI not configured");
        }

        try {
            Long userId = Long.parseLong(userIdStr);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userId));

            LocalDate today = LocalDate.now();
            List<Task> todayTasks = taskRepository.findByDateAndUserIdAndSkippedFalseOrderByCreatedAtAsc(today, userId);

            String systemPrompt = buildSystemPrompt(user, todayTasks, today);
            List<Map<String, String>> messages = buildMessages(request);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", MODEL);
            body.put("max_tokens", MAX_TOKENS);
            body.put("system", systemPrompt);
            body.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    ANTHROPIC_URL,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            String text = extractText(responseEntity.getBody());
            return AiChatResponse.ok(text);

        } catch (HttpClientErrorException e) {
            log.error("Erro HTTP ao chamar a API do Claude: {} — {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                return AiChatResponse.error("Chave de API inválida ou não autorizada");
            }
            if (e.getStatusCode().value() == 429) {
                return AiChatResponse.error("Limite de requisições atingido, tente novamente em instantes");
            }
            return AiChatResponse.error("Erro ao chamar a IA: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Erro inesperado ao chamar a API do Claude: {}", e.getMessage(), e);
            return AiChatResponse.error("Erro ao processar sua mensagem");
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private String buildSystemPrompt(User user, List<Task> todayTasks, LocalDate today) {
        String taskList;
        if (todayTasks.isEmpty()) {
            taskList = "(nenhuma tarefa cadastrada para hoje)";
        } else {
            taskList = todayTasks.stream()
                    .map(t -> {
                        String icon = t.isCompleted() ? "✅" : "⭕";
                        return String.format("- [%s] %s (%s)", icon, t.getTitle(), t.getType().name());
                    })
                    .collect(Collectors.joining("\n"));
        }

        return """
                Você é o assistente pessoal de produtividade do TaskFlow, um app de gerenciamento de hábitos e tarefas.

                Contexto atual do usuário:
                - Nome: %s
                - Streak atual: %d dias consecutivos
                - Melhor streak: %d dias
                - Tarefas de hoje (%s):
                %s

                Sua função:
                1. Sugerir novas tarefas/hábitos com base no perfil e histórico
                2. Analisar a produtividade de forma encorajadora e construtiva
                3. Gerar rotinas diárias personalizadas quando solicitado
                4. Responder perguntas sobre produtividade, hábitos e bem-estar
                5. Dar feedback motivador sobre o progresso

                Diretrizes:
                - Responda SEMPRE em português brasileiro
                - Seja conciso (máx 3 parágrafos por resposta)
                - Use emojis ocasionalmente para tornar a conversa dinâmica
                - Se não houver tarefas hoje, sugira começar com hábitos simples
                - Lembre-se do contexto do usuário nas sugestões
                """.formatted(
                user.getName(),
                user.getCurrentStreak(),
                user.getBestStreak(),
                today,
                taskList
        );
    }

    /**
     * Builds the messages array from history + the new user message.
     * History entries must alternate user/assistant; we append the new message at the end.
     */
    private List<Map<String, String>> buildMessages(AiChatRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();

        if (request.history() != null) {
            for (AiChatRequest.ChatMessage msg : request.history()) {
                Map<String, String> entry = new LinkedHashMap<>();
                entry.put("role", msg.role());
                entry.put("content", msg.content());
                messages.add(entry);
            }
        }

        Map<String, String> userMessage = new LinkedHashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", request.message());
        messages.add(userMessage);

        return messages;
    }

    /**
     * Extracts the text from the Anthropic response body:
     * body → content[0] → text
     */
    @SuppressWarnings("unchecked")
    private String extractText(Map responseBody) {
        if (responseBody == null) {
            throw new IllegalStateException("Resposta vazia da API do Claude");
        }
        List<Map<String, Object>> content = (List<Map<String, Object>>) responseBody.get("content");
        if (content == null || content.isEmpty()) {
            throw new IllegalStateException("Campo 'content' ausente ou vazio na resposta da API");
        }
        Object text = content.get(0).get("text");
        if (text == null) {
            throw new IllegalStateException("Campo 'text' ausente no primeiro bloco de conteúdo");
        }
        return text.toString();
    }
}
