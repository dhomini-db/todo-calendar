package com.todocalendar.dto;

import com.todocalendar.entity.RecurrenceType;
import com.todocalendar.entity.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskTemplateRequest {

    @NotBlank(message = "O título não pode estar em branco")
    private String title;

    private String description;

    @NotNull(message = "O tipo é obrigatório")
    private TaskType type;

    @NotNull(message = "O tipo de recorrência é obrigatório")
    private RecurrenceType recurrenceType;

    /**
     * Obrigatório somente quando recurrenceType = WEEKLY.
     * Formato: "1,3,5" (1=SEG ... 7=DOM)
     */
    private String daysOfWeek;
}
