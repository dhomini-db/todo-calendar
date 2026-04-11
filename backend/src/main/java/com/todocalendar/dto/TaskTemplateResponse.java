package com.todocalendar.dto;

import com.todocalendar.entity.RecurrenceType;
import com.todocalendar.entity.TaskType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaskTemplateResponse {
    private Long id;
    private String title;
    private String description;
    private TaskType type;
    private RecurrenceType recurrenceType;
    private String daysOfWeek;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
