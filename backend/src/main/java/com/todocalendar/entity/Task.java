package com.todocalendar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que representa uma tarefa no banco de dados.
 * Cada tarefa pertence a um dia específico (date) e pode ser marcada como concluída.
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Data à qual a tarefa pertence (sem hora — um dia inteiro).
     * Ex: 2024-04-10
     */
    @Column(nullable = false)
    private LocalDate date;

    /**
     * Indica se a tarefa foi concluída.
     * Usado no cálculo de porcentagem de conclusão do dia.
     */
    @Column(nullable = false)
    private boolean completed = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
