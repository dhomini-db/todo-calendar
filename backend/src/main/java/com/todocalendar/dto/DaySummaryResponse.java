package com.todocalendar.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

/**
 * Resumo de um dia: quantas tarefas existem, quantas foram concluídas,
 * a porcentagem e a cor correspondente.
 *
 * Regras de cor:
 *   - 100%       → GREEN
 *   - 70% a 99%  → LIGHT_GREEN  (adicionado como intermediário útil)
 *   - 50% a 69%  → YELLOW
 *   - 1% a 49%   → RED
 *   - 0 tarefas  → NONE
 */
@Data
@Builder
public class DaySummaryResponse {
    private LocalDate date;
    private int total;
    private int completed;
    private double percentage;
    private String color;
}
