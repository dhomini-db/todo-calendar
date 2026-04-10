package com.todocalendar.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de saída que representa uma tarefa no response da API.
 */
@Data
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
