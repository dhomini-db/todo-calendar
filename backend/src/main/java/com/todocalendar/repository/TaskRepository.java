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
     * Todas as instâncias de um template recorrente do usuário (todos os dias),
     * incluindo as já skipped. Usado para exclusão em massa ao deletar tarefa recorrente.
     */
    List<Task> findBySourceTemplateIdAndUserIdOrderByDateAsc(Long sourceTemplateId, Long userId);

    /** Todas as tarefas visíveis do usuário, para exportação CSV. */
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.skipped = false ORDER BY t.date DESC, t.createdAt DESC")
    List<Task> findAllForExport(@Param("userId") Long userId);

    /** Total de tarefas POSITIVAS concluídas por um usuário (all-time) — para perfil público. */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.skipped = false AND t.type = 'POSITIVE' AND t.completed = true AND t.interacted = true")
    long countAllTimeCompletedByUser(@Param("userId") Long userId);

    /** Total de tarefas visíveis (skipped=false) em um período. */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.date BETWEEN :start AND :end AND t.skipped = false")
    long countTasksInPeriod(
            @Param("start")  LocalDate start,
            @Param("end")    LocalDate end,
            @Param("userId") Long userId
    );

    /** Total de tarefas POSITIVAS concluídas (boa escolha) em um período. */
    @Query("""
            SELECT COUNT(t) FROM Task t
            WHERE t.user.id = :userId
              AND t.date BETWEEN :start AND :end
              AND t.skipped = false
              AND t.type = 'POSITIVE'
              AND t.completed = true
              AND t.interacted = true
           """)
    long countPositiveCompletedInPeriod(
            @Param("start")  LocalDate start,
            @Param("end")    LocalDate end,
            @Param("userId") Long userId
    );

    /**
     * Retorna por dia: denominador efetivo, boas escolhas e qtd interagidas.
     *
     * Regras:
     *   - Denominador = POSITIVAS (todas) + NEGATIVAS checadas (completed+interacted).
     *     Negativas não-checadas são NEUTRAS — não penalizam o score.
     *   - Numerador   = POSITIVE + completed + interacted (boa escolha explícita).
     *   - Cor/% só aparece quando interacted_count > 0 (usuário interagiu ao menos 1 vez).
     *
     * Porcentagem = goodOutcomes / effectiveDenominator × 100
     */
    @Query("""
            SELECT t.date,
                   SUM(CASE
                         WHEN t.type = 'POSITIVE'
                           OR (t.type = 'NEGATIVE' AND t.completed = true AND t.interacted = true)
                         THEN 1 ELSE 0
                       END),
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
