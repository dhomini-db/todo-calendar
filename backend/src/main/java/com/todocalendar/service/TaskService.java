package com.todocalendar.service;

import com.todocalendar.dto.DaySummaryResponse;
import com.todocalendar.dto.TaskRequest;
import com.todocalendar.dto.TaskResponse;
import com.todocalendar.entity.Task;
import com.todocalendar.entity.User;
import com.todocalendar.repository.TaskRepository;
import com.todocalendar.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // ── CRUD ───────────────────────────────────────────────────

    public List<TaskResponse> getTasksByDate(LocalDate date, Long userId) {
        return taskRepository.findByDateAndUserIdOrderByCreatedAtAsc(date, userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, Long userId) {
        User user = userRepository.getReferenceById(userId);
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .completed(false)
                .user(user)
                .build();
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request, Long userId) {
        Task task = findOrThrow(id, userId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDate(request.getDate());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse toggleCompletion(Long id, Long userId) {
        Task task = findOrThrow(id, userId);
        task.setCompleted(!task.isCompleted());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id, Long userId) {
        findOrThrow(id, userId);
        taskRepository.deleteById(id);
    }

    // ── Resumo mensal ──────────────────────────────────────────

    public Map<String, DaySummaryResponse> getMonthlySummary(int year, int month, Long userId) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end   = yearMonth.atEndOfMonth();

        List<Object[]> rows = taskRepository.findDailySummary(start, end, userId);

        Map<String, DaySummaryResponse> summary = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDate date     = (LocalDate) row[0];
            long total         = (Long) row[1];
            long completed     = (Long) row[2];
            double percentage  = total == 0 ? 0 : (completed * 100.0) / total;
            String color       = resolveColor(percentage, total);

            summary.put(date.toString(), DaySummaryResponse.builder()
                    .date(date)
                    .total((int) total)
                    .completed((int) completed)
                    .percentage(Math.round(percentage * 10.0) / 10.0)
                    .color(color)
                    .build());
        }
        return summary;
    }

    // ── Utilitários privados ───────────────────────────────────

    private String resolveColor(double percentage, long total) {
        if (total == 0)        return "NONE";
        if (percentage == 100) return "GREEN";
        if (percentage >= 70)  return "LIGHT_GREEN";
        if (percentage >= 50)  return "YELLOW";
        return "RED";
    }

    /**
     * Busca a tarefa e verifica se pertence ao usuário.
     * Lança 404 se não existir ou se pertencer a outro usuário.
     */
    private Task findOrThrow(Long id, Long userId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada: " + id));
        if (task.getUser() != null && !task.getUser().getId().equals(userId)) {
            throw new EntityNotFoundException("Tarefa não encontrada: " + id);
        }
        return task;
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .date(task.getDate())
                .completed(task.isCompleted())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
