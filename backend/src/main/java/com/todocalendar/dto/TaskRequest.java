package com.todocalendar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO de entrada para criação e atualização de tarefas.
 * Evita expor a entidade diretamente na API.
 */
@Data
public class TaskRequest {

    @NotBlank(message = "O título não pode estar em branco")
    private String title;

    private String description;

    @NotNull(message = "A data é obrigatória")
    private LocalDate date;
}
