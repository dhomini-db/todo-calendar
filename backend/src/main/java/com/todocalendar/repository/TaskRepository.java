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
     * Retorna por dia: total de tarefas, boas escolhas e qtd interagidas.
     *
     * Regras:
     *   - Denominador = TODAS as tarefas do dia (não apenas as interagidas).
     *   - Numerador   = POSITIVE + completed + interacted (boa escolha explícita).
     *   - Cor/% só aparece quando interacted_count > 0 (usuário interagiu ao menos 1 vez).
     *   - NEGATIVE desmarcada (interacted=false) → conta no denominador → reduz %.
     *   - Isso corrige o bug "1 positiva marcada = 100%" quando existem outras tarefas.
     *
     * Porcentagem = goodOutcomes / allTasks × 100   (mas só exibe se interacted > 0)
     */
    @Query("""
            SELECT t.date,
                   COUNT(t),
                   SUM(CASE
                         WHEN t.type = 'POSITIVE' AND t.completed = true AND t.interacted = true THEN 1
                         ELSE 0
                       END),
                   SUM(CASE WHEN t.completed = true AND t.interacted = true THEN 1 ELSE 0 END)
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
