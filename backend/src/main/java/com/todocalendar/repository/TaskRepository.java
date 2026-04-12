package com.todocalendar.repository;

import com.todocalendar.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    /** Todas as tarefas do dia (inclui skipped — usado para checagem de template existente). */
    List<Task> findByDateAndUserIdOrderByCreatedAtAsc(LocalDate date, Long userId);

    /** Somente tarefas visíveis (exclui skipped) — usado para exibição ao usuário. */
    List<Task> findByDateAndUserIdAndSkippedFalseOrderByCreatedAtAsc(LocalDate date, Long userId);

    /**
     * Retorna por dia: total de tarefas marcadas (interacted=true) e boas escolhas.
     *
     * Regras:
     *   - Apenas tarefas com interacted=true entram no cálculo (checkbox marcado).
     *   - Tarefa POSITIVE marcada (completed=true)  → boa escolha (+1 good, +1 total)
     *   - Tarefa NEGATIVE marcada (completed=true)  → má escolha  (+0 good, +1 total) → reduz %
     *   - Qualquer tarefa PENDING (interacted=false) → ignorada completamente
     *
     * Porcentagem = goodOutcomes / totalInteracted × 100
     */
    @Query("""
            SELECT t.date,
                   SUM(CASE WHEN t.interacted = true THEN 1 ELSE 0 END),
                   SUM(CASE
                         WHEN t.interacted = true AND t.type = 'POSITIVE' AND t.completed = true THEN 1
                         ELSE 0
                       END)
            FROM Task t
            WHERE t.date BETWEEN :start AND :end
              AND t.user.id = :userId
              AND t.skipped = false
            GROUP BY t.date
            ORDER BY t.date
           """)
    List<Object[]> findDailySummary(
            @Param("start")  LocalDate start,
            @Param("end")    LocalDate end,
            @Param("userId") Long userId
    );
}
