package com.todocalendar.dto;

import com.todocalendar.entity.TaskType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private boolean completed;
    private TaskType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
