package com.todocalendar.entity;

/**
 * Tipo da tarefa.
 *
 * POSITIVE — algo que você quer FAZER (ex: estudar, exercitar).
 *            Contribui positivamente quando concluída.
 *
 * NEGATIVE — algo que você quer EVITAR (ex: procrastinar, comer junk food).
 *            Contribui positivamente quando NÃO concluída (você resistiu).
 */
public enum TaskType {
    POSITIVE,
    NEGATIVE
}
