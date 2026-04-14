package com.todocalendar.service;

import com.todocalendar.dto.StreakResponse;
import com.todocalendar.entity.User;
import com.todocalendar.repository.TaskRepository;
import com.todocalendar.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    private static final double STREAK_THRESHOLD = 70.0;
    private static final String[] DAY_NAMES = {"Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"};

    /**
     * Sincroniza o streak do usuário com base no progresso de hoje e retorna os dados atuais.
     * Regras:
     *   - >= 70% hoje  → conta como dia completo
     *   - Gap de 1 dia → pode estender (streak mantido até fim do dia anterior)
     *   - Gap de 2+    → streak zerado; começa do zero se hoje qualifica
     */
    @Transactional
    public StreakResponse getAndSync(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userId));

        LocalDate today   = LocalDate.now();
        double todayPct   = calculatePercentage(today, userId);
        boolean qualifies = todayPct >= STREAK_THRESHOLD;

        LocalDate last = user.getLastCompletedDate();

        if (last == null) {
            // Nunca completou nenhum dia
            if (qualifies) {
                user.setCurrentStreak(1);
                user.setBestStreak(Math.max(1, user.getBestStreak()));
                user.setLastCompletedDate(today);
            }
        } else if (last.equals(today)) {
            // Já sincronizou hoje — reavalia caso o progresso tenha mudado
            if (qualifies) {
                user.setBestStreak(Math.max(user.getCurrentStreak(), user.getBestStreak()));
            } else {
                // Caiu abaixo de 70%: reverte o dia de hoje do streak
                int newStreak = Math.max(0, user.getCurrentStreak() - 1);
                user.setCurrentStreak(newStreak);
                if (newStreak == 0) {
                    user.setLastCompletedDate(null);
                } else {
                    user.setLastCompletedDate(today.minusDays(1));
                }
            }
        } else if (last.equals(today.minusDays(1))) {
            // Ontem foi o último dia completo — pode estender hoje
            if (qualifies) {
                user.setCurrentStreak(user.getCurrentStreak() + 1);
                user.setBestStreak(Math.max(user.getCurrentStreak(), user.getBestStreak()));
                user.setLastCompletedDate(today);
            }
            // Caso contrário: streak fica parado (ainda dentro da janela do dia)
        } else {
            // Gap de 2+ dias — streak quebrado
            if (qualifies) {
                user.setCurrentStreak(1);
                user.setBestStreak(Math.max(1, user.getBestStreak()));
                user.setLastCompletedDate(today);
            } else {
                user.setCurrentStreak(0);
                user.setLastCompletedDate(null);
            }
        }

        userRepository.save(user);

        boolean completedToday = today.equals(user.getLastCompletedDate());
        List<StreakResponse.DayStatus> weekDays = buildWeekDays(userId, today);

        return StreakResponse.builder()
                .currentStreak(user.getCurrentStreak())
                .bestStreak(user.getBestStreak())
                .lastCompletedDate(user.getLastCompletedDate() != null
                        ? user.getLastCompletedDate().toString() : null)
                .completedToday(completedToday)
                .weekDays(weekDays)
                .build();
    }

    /** Calcula o percentual efetivo de um dia. Retorna 0.0 se não há tarefas ou denominador 0. */
    private double calculatePercentage(LocalDate date, Long userId) {
        List<Object[]> rows = taskRepository.findDailySummary(date, date, userId);
        if (rows.isEmpty()) return 0.0;
        Object[] row        = rows.get(0);
        long denominator    = ((Number) row[1]).longValue();
        long goodOutcomes   = ((Number) row[2]).longValue();
        long interacted     = ((Number) row[3]).longValue();
        if (denominator == 0 || interacted == 0) return 0.0;
        return (goodOutcomes * 100.0) / denominator;
    }

    /** Constrói o grid de Seg–Dom da semana atual, marcando quais dias atingiram >= 70%. */
    private List<StreakResponse.DayStatus> buildWeekDays(Long userId, LocalDate today) {
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);

        // Consulta apenas até hoje (dias futuros sem dados)
        LocalDate queryEnd = sunday.isAfter(today) ? today : sunday;

        List<Object[]> rows = taskRepository.findDailySummary(monday, queryEnd, userId);
        Map<LocalDate, Object[]> byDate = new HashMap<>();
        for (Object[] row : rows) {
            byDate.put((LocalDate) row[0], row);
        }

        List<StreakResponse.DayStatus> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day      = monday.plusDays(i);
            boolean isFuture   = day.isAfter(today);
            boolean completed  = false;

            if (!isFuture && byDate.containsKey(day)) {
                Object[] row    = byDate.get(day);
                long denom      = ((Number) row[1]).longValue();
                long good       = ((Number) row[2]).longValue();
                long interacted = ((Number) row[3]).longValue();
                if (denom > 0 && interacted > 0) {
                    completed = (good * 100.0 / denom) >= STREAK_THRESHOLD;
                }
            }

            result.add(StreakResponse.DayStatus.builder()
                    .date(day.toString())
                    .dayName(DAY_NAMES[i])
                    .completed(completed)
                    .isToday(day.equals(today))
                    .isFuture(isFuture)
                    .build());
        }
        return result;
    }
}
