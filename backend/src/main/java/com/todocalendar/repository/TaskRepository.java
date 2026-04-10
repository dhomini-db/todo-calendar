package com.todocalendar.repository;

import com.todocalendar.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByDateAndUserIdOrderByCreatedAtAsc(LocalDate date, Long userId);

    @Query("""
            SELECT t.date, COUNT(t),
                   SUM(CASE WHEN t.completed = true THEN 1 ELSE 0 END)
            FROM Task t
            WHERE t.date BETWEEN :start AND :end
              AND t.user.id = :userId
            GROUP BY t.date
            ORDER BY t.date
           """)
    List<Object[]> findDailySummary(
            @Param("start")  LocalDate start,
            @Param("end")    LocalDate end,
            @Param("userId") Long userId
    );
}
