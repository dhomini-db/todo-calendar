package com.todocalendar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Modelo de tarefa recorrente.
 * Não representa um dia específico — é o "molde" a partir do qual
 * instâncias diárias (Task) são geradas automaticamente.
 */
@Entity
@Table(name = "task_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskType type = TaskType.POSITIVE;

    /**
     * Padrão de recorrência.
     * DAILY  → gera task em todos os dias.
     * WEEKLY → gera apenas nos dias definidos em daysOfWeek.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecurrenceType recurrenceType = RecurrenceType.DAILY;

    /**
     * Para recorrência WEEKLY: dias da semana separados por vírgula.
     * Usa os valores de java.time.DayOfWeek ordinal:
     *   1 = MONDAY, 2 = TUESDAY, ..., 7 = SUNDAY
     * Exemplo: "1,3,5" = segunda, quarta e sexta.
     * Ignorado para DAILY.
     */
    @Column(length = 20)
    private String daysOfWeek;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
