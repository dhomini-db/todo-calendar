package com.todocalendar.service;

import com.todocalendar.dto.TaskTemplateRequest;
import com.todocalendar.dto.TaskTemplateResponse;
import com.todocalendar.entity.RecurrenceType;
import com.todocalendar.entity.Task;
import com.todocalendar.entity.TaskTemplate;
import com.todocalendar.entity.User;
import com.todocalendar.repository.TaskRepository;
import com.todocalendar.repository.TaskTemplateRepository;
import com.todocalendar.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskTemplateService {

    private final TaskTemplateRepository templateRepository;
    private final TaskRepository          taskRepository;
    private final UserRepository          userRepository;

    // ── CRUD de templates ──────────────────────────────────────

    public List<TaskTemplateResponse> listAll(Long userId) {
        return templateRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TaskTemplateResponse create(TaskTemplateRequest req, Long userId) {
        User user = userRepository.getReferenceById(userId);
        TaskTemplate template = TaskTemplate.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .type(req.getType())
                .recurrenceType(req.getRecurrenceType())
                .daysOfWeek(req.getDaysOfWeek())
                .active(true)
                .user(user)
                .build();
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public TaskTemplateResponse update(Long id, TaskTemplateRequest req, Long userId) {
        TaskTemplate template = findOrThrow(id, userId);
        template.setTitle(req.getTitle());
        template.setDescription(req.getDescription());
        template.setType(req.getType());
        template.setRecurrenceType(req.getRecurrenceType());
        template.setDaysOfWeek(req.getDaysOfWeek());
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public TaskTemplateResponse toggleActive(Long id, Long userId) {
        TaskTemplate template = findOrThrow(id, userId);
        template.setActive(!template.isActive());
        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        findOrThrow(id, userId);
        templateRepository.deleteById(id);
    }

    // ── Geração automática de instâncias ──────────────────────

    /**
     * Garante que todos os templates ativos do usuário tenham uma Task
     * correspondente para a data informada. Idempotente — nunca duplica.
     *
     * Chamado internamente pelo TaskService.getTasksByDate().
     */
    @Transactional
    public void generateInstancesForDate(LocalDate date, Long userId) {
        User user = userRepository.getReferenceById(userId);
        List<TaskTemplate> activeTemplates =
                templateRepository.findByUserIdAndActiveTrueOrderByCreatedAtAsc(userId);

        // IDs de templates que já têm instância neste dia
        List<Task> existingTasks =
                taskRepository.findByDateAndUserIdOrderByCreatedAtAsc(date, userId);

        Set<Long> existingTemplateIds = existingTasks.stream()
                .filter(t -> t.getSourceTemplateId() != null)
                .map(Task::getSourceTemplateId)
                .collect(Collectors.toSet());

        DayOfWeek dayOfWeek = date.getDayOfWeek();

        for (TaskTemplate template : activeTemplates) {
            // Já existe instância para este template neste dia → pular
            if (existingTemplateIds.contains(template.getId())) {
                continue;
            }

            // Verificar se a recorrência se aplica a esta data
            if (!appliesToDate(template, dayOfWeek)) {
                continue;
            }

            Task instance = Task.builder()
                    .title(template.getTitle())
                    .description(template.getDescription())
                    .date(date)
                    .completed(false)
                    .type(template.getType())
                    .user(user)
                    .sourceTemplateId(template.getId())
                    .build();

            taskRepository.save(instance);
        }
    }

    // ── Utilitários privados ───────────────────────────────────

    /**
     * Verifica se o template deve gerar instância no dia da semana informado.
     */
    private boolean appliesToDate(TaskTemplate template, DayOfWeek dayOfWeek) {
        if (template.getRecurrenceType() == RecurrenceType.DAILY) {
            return true;
        }
        // WEEKLY — verifica se o dia está na lista
        if (template.getDaysOfWeek() == null || template.getDaysOfWeek().isBlank()) {
            return false;
        }
        // daysOfWeek armazena os valores de DayOfWeek.getValue() (1=SEG...7=DOM)
        Set<Integer> days = Arrays.stream(template.getDaysOfWeek().split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toSet());
        return days.contains(dayOfWeek.getValue());
    }

    private TaskTemplate findOrThrow(Long id, Long userId) {
        TaskTemplate t = templateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template não encontrado: " + id));
        if (!t.getUser().getId().equals(userId)) {
            throw new EntityNotFoundException("Template não encontrado: " + id);
        }
        return t;
    }

    private TaskTemplateResponse toResponse(TaskTemplate t) {
        return TaskTemplateResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .type(t.getType())
                .recurrenceType(t.getRecurrenceType())
                .daysOfWeek(t.getDaysOfWeek())
                .active(t.isActive())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
