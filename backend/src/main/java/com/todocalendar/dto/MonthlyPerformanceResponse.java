package com.todocalendar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Representa o desempenho médio do usuário em um mês.
 * {@code percentage} é null quando o usuário não tem dados naquele mês.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyPerformanceResponse {

    /** Abreviação do mês: "Jan", "Fev", ..., "Dez". */
    private String month;

    /**
     * Média das porcentagens diárias do mês (0–100).
     * Null quando não há nenhum dia com interação no mês.
     */
    private Integer percentage;
}
