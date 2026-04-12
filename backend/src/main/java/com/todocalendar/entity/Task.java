package com.todocalendar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private boolean completed = false;

    /**
     * true  = usuário interagiu com a tarefa (toggle chamado ao menos uma vez,
     *         ou tarefa criada manualmente).
     * false = instância gerada automaticamente por template, ainda não tocada.
     *
     * Apenas tarefas com interacted=true entram no cálculo de progresso.
     * @ColumnDefault garante que o Hibernate gere DEFAULT false no ALTER TABLE
     * ao rodar ddl-auto=update em bancos com dados existentes.
     */
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean interacted = false;

    /**
     * Tipo da tarefa: POSITIVE (fazer) ou NEGATIVE (evitar).
     * Padrão POSITIVE para manter compatibilidade com tarefas existentes.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskType type = TaskType.POSITIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /**
     * Tarefa recorrente "excluída" pelo usuário para uma data específica.
     * true  = invisível ao usuário + bloqueia regeneração para esta data.
     * false = normal (padrão).
     *
     * Tarefas manuais (sourceTemplateId=null) são deletadas fisicamente;
     * tarefas recorrentes recebem skipped=true para evitar regeneração.
     */
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean skipped = false;

    /**
     * Referência ao template que gerou esta instância (nullable).
     * null = tarefa criada manualmente pelo usuário.
     */
    @Column(name = "source_template_id")
    private Long sourceTemplateId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
