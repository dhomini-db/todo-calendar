package com.todocalendar.service;

import com.todocalendar.dto.MonthlyPerformanceResponse;
import com.todocalendar.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Serviço de estatísticas — calcula métricas agregadas de desempenho do usuário.
 *
 * <h3>Lógica do desempenho mensal</h3>
 * Para cada mês do ano corrente:
 * <ol>
 *   <li>Busca os dados diários via {@code TaskRepository.findDailySummary}
 *       (mesma query usada pelo StreakService).</li>
 *   <li>Filtra apenas os dias em que o usuário interagiu com ao menos uma tarefa
 *       ({@code interacted > 0}) E há denominador > 0 (existem tarefas contáveis).</li>
 *   <li>Calcula a média aritmética das porcentagens diárias:
 *       {@code porcentagem_dia = boas_escolhas / denominador × 100}</li>
 *   <li>Arredonda para inteiro. Se nenhum dia válido, retorna {@code null}
 *       (sem dados), não 0 — o frontend distingue os dois casos visualmente.</li>
 * </ol>
 *
 * <h3>Denominador efetivo (herdado do modelo de tarefas)</h3>
 * <ul>
 *   <li>Tarefas POSITIVAS — sempre entram no denominador.</li>
 *   <li>Tarefas NEGATIVAS checadas (completed + interacted) — também entram
 *       no denominador (o usuário cedeu ao hábito ruim → penaliza).</li>
 *   <li>Tarefas NEGATIVAS não-checadas — neutras, não penalizam.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class StatsService {

    private final TaskRepository taskRepository;

    private static final String[] MONTH_NAMES =
            {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
             "Jul", "Ago", "Set", "Out", "Nov", "Dez"};

    /**
     * Retorna a performance média de cada mês do ano corrente para o usuário.
     * Meses futuros (ainda sem dados) chegam com {@code percentage = null}.
     */
    public List<MonthlyPerformanceResponse> getMonthlyPerformance(Long userId) {
        LocalDate today = LocalDate.now();
        int year = today.getYear();

        List<MonthlyPerformanceResponse> result = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            LocalDate start = LocalDate.of(year, month, 1);

            // Mês ainda não começou — sem dados
            if (start.isAfter(today)) {
                result.add(MonthlyPerformanceResponse.builder()
                        .month(MONTH_NAMES[month - 1])
                        .percentage(null)
                        .build());
                continue;
            }

            // Último dia do mês, mas nunca além de hoje
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            if (end.isAfter(today)) {
                end = today;
            }

            List<Object[]> rows = taskRepository.findDailySummary(start, end, userId);

            double totalPct = 0.0;
            int validDays   = 0;

            for (Object[] row : rows) {
                long denom      = ((Number) row[1]).longValue();
                long good       = ((Number) row[2]).longValue();
                long interacted = ((Number) row[3]).longValue();

                // Só conta dias em que o usuário interagiu E há tarefas contáveis
                if (denom > 0 && interacted > 0) {
                    totalPct += (good * 100.0) / denom;
                    validDays++;
                }
            }

            Integer percentage = validDays > 0
                    ? (int) Math.round(totalPct / validDays)
                    : null;

            result.add(MonthlyPerformanceResponse.builder()
                    .month(MONTH_NAMES[month - 1])
                    .percentage(percentage)
                    .build());
        }

        return result;
    }
}
