package com.todocalendar.dto;

import com.todocalendar.entity.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "O título não pode estar em branco")
    private String title;

    private String description;

    @NotNull(message = "A data é obrigatória")
    private LocalDate date;

    /** Padrão POSITIVE se não informado pelo frontend */
    private TaskType type;
}
