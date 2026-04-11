package com.todocalendar.repository;

import com.todocalendar.entity.TaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {

    /** Todos os templates ativos de um usuário */
    List<TaskTemplate> findByUserIdAndActiveTrueOrderByCreatedAtAsc(Long userId);

    /** Todos os templates de um usuário (para a página de gerenciamento) */
    List<TaskTemplate> findByUserIdOrderByCreatedAtAsc(Long userId);
}
