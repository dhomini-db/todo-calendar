package com.todocalendar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dados completos do Dashboard do usuário.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    /** Porcentagem de conclusão hoje (0–100). Null = sem tarefas/interação hoje. */
    private Integer scoreHoje;

    /** Dias consecutivos com desempenho ≥ 50%. */
    private int streakAtual;

    /** Total de tarefas visíveis criadas/geradas no mês corrente (skipped=false). */
    private long tarefasTotalMes;

    /** Tarefas POSITIVAS concluídas no mês corrente. */
    private long tarefasConcluidasMes;

    /** Média das porcentagens diárias do mês corrente. Null = sem dados ainda. */
    private Integer taxaConclusaoMes;

    /** Últimos 30 dias com suas porcentagens diárias (para o gráfico). */
    private List<DailyScore> last30Days;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyScore {

        /** Data no formato "YYYY-MM-DD". */
        private String date;

        /** Label curto para o eixo X: "12/04". */
        private String label;

        /** Porcentagem do dia (0–100). Null = sem interação naquele dia. */
        private Integer percentage;
    }
}
