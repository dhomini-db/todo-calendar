package com.todocalendar.repository;

import com.todocalendar.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Busca todas as tarefas de um dia específico.
     */
    List<Task> findByDateOrderByCreatedAtAsc(LocalDate date);

    /**
     * Busca todas as tarefas num intervalo de datas.
     * Usado para gerar o resumo mensal.
     */
    List<Task> findByDateBetweenOrderByDateAsc(LocalDate start, LocalDate end);

    /**
     * Retorna uma projeção com: data, total de tarefas e total concluídas.
     * Agrupado por data para calcular a porcentagem de cada dia no mês.
     *
     * A query JPQL usa CASE WHEN para contar apenas as tarefas com completed=true.
     */
    @Query("SELECT t.date, COUNT(t), SUM(CASE WHEN t.completed = true THEN 1 ELSE 0 END) " +
           "FROM Task t WHERE t.date BETWEEN :start AND :end GROUP BY t.date ORDER BY t.date")
    List<Object[]> findDailySummary(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
