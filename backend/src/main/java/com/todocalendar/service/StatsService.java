package com.todocalendar.service;

import com.todocalendar.dto.DashboardStatsResponse;
import com.todocalendar.dto.DashboardStatsResponse.DailyScore;
import com.todocalendar.dto.MonthlyPerformanceResponse;
import com.todocalendar.entity.User;
import com.todocalendar.repository.TaskRepository;
import com.todocalendar.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final UserRepository  userRepository;

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

    // ── Dashboard ──────────────────────────────────────────────────────────────

    /**
     * Retorna todos os dados necessários para o Dashboard em uma única chamada.
     *
     * <ul>
     *   <li><b>scoreHoje</b>: porcentagem efetiva de hoje via findDailySummary.</li>
     *   <li><b>streakAtual</b>: lido direto da entidade User (já gerenciado pelo StreakService).</li>
     *   <li><b>tarefasTotalMes / tarefasConcluidasMes</b>: contagem via queries de repositório.</li>
     *   <li><b>taxaConclusaoMes</b>: média das porcentagens diárias do mês corrente.</li>
     *   <li><b>last30Days</b>: array com entrada para cada dia dos últimos 30 dias;
     *       dias sem interação chegam com percentage = null (o frontend mostra como lacunas).</li>
     * </ul>
     */
    public DashboardStatsResponse getDashboardStats(Long userId) {
        LocalDate today      = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate from30     = today.minusDays(29);

        // 1. Score de hoje
        Integer scoreHoje = calcDayPercentage(today, userId);

        // 2. Streak atual (estado salvo pelo StreakService)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userId));
        int streakAtual = user.getCurrentStreak();

        // 3. Contagens do mês
        long totalMes      = taskRepository.countTasksInPeriod(monthStart, today, userId);
        long concluidasMes = taskRepository.countPositiveCompletedInPeriod(monthStart, today, userId);

        // 4. Taxa de conclusão do mês (média das % diárias)
        Integer taxaMes = calcRangeAverage(monthStart, today, userId);

        // 5. Últimos 30 dias — um ponto por dia (null quando sem interação)
        List<DailyScore> last30 = buildLast30Days(from30, today, userId);

        return DashboardStatsResponse.builder()
                .scoreHoje(scoreHoje)
                .streakAtual(streakAtual)
                .tarefasTotalMes(totalMes)
                .tarefasConcluidasMes(concluidasMes)
                .taxaConclusaoMes(taxaMes)
                .last30Days(last30)
                .build();
    }

    // ── Helpers privados ───────────────────────────────────────────────────────

    /** Porcentagem efetiva de um único dia. Null se sem dados ou sem interação. */
    private Integer calcDayPercentage(LocalDate date, Long userId) {
        List<Object[]> rows = taskRepository.findDailySummary(date, date, userId);
        if (rows.isEmpty()) return null;
        Object[] r    = rows.get(0);
        long denom    = ((Number) r[1]).longValue();
        long good     = ((Number) r[2]).longValue();
        long interact = ((Number) r[3]).longValue();
        if (denom == 0 || interact == 0) return null;
        return (int) Math.round(good * 100.0 / denom);
    }

    /** Média das porcentagens diárias de um intervalo. Null se nenhum dia válido. */
    private Integer calcRangeAverage(LocalDate start, LocalDate end, Long userId) {
        List<Object[]> rows = taskRepository.findDailySummary(start, end, userId);
        double total = 0.0;
        int count    = 0;
        for (Object[] r : rows) {
            long denom    = ((Number) r[1]).longValue();
            long good     = ((Number) r[2]).longValue();
            long interact = ((Number) r[3]).longValue();
            if (denom > 0 && interact > 0) {
                total += (good * 100.0) / denom;
                count++;
            }
        }
        return count > 0 ? (int) Math.round(total / count) : null;
    }

    /** Constrói a série dos últimos 30 dias com label "dd/MM" e porcentagem (ou null). */
    private List<DailyScore> buildLast30Days(LocalDate from, LocalDate to, Long userId) {
        List<Object[]> rows = taskRepository.findDailySummary(from, to, userId);

        // Indexa por data para lookup O(1)
        Map<LocalDate, Object[]> byDate = new HashMap<>();
        for (Object[] r : rows) byDate.put((LocalDate) r[0], r);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        List<DailyScore> result = new ArrayList<>();

        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            Integer pct = null;
            if (byDate.containsKey(d)) {
                Object[] r    = byDate.get(d);
                long denom    = ((Number) r[1]).longValue();
                long good     = ((Number) r[2]).longValue();
                long interact = ((Number) r[3]).longValue();
                if (denom > 0 && interact > 0) {
                    pct = (int) Math.round(good * 100.0 / denom);
                }
            }
            result.add(DailyScore.builder()
                    .date(d.toString())
                    .label(d.format(fmt))
                    .percentage(pct)
                    .build());
        }
        return result;
    }
}
