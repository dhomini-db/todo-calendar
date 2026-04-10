package com.todocalendar.service;

import com.todocalendar.dto.DaySummaryResponse;
import com.todocalendar.dto.TaskRequest;
import com.todocalendar.dto.TaskResponse;
import com.todocalendar.entity.Task;
import com.todocalendar.repository.TaskRepository;
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

    // ──────────────────────────────────────────────
    // CRUD
    // ──────────────────────────────────────────────

    public List<TaskResponse> getTasksByDate(LocalDate date) {
        return taskRepository.findByDateOrderByCreatedAtAsc(date)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .completed(false)
                .build();
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findOrThrow(id);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDate(request.getDate());
        return toResponse(taskRepository.save(task));
    }

    /**
     * Alterna o estado de conclusão da tarefa (toggle).
     * Se estava false → vira true; se estava true → vira false.
     */
    @Transactional
    public TaskResponse toggleCompletion(Long id) {
        Task task = findOrThrow(id);
        task.setCompleted(!task.isCompleted());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id) {
        findOrThrow(id);
        taskRepository.deleteById(id);
    }

    // ──────────────────────────────────────────────
    // Resumo mensal com cálculo de porcentagem e cor
    // ──────────────────────────────────────────────

    /**
     * Para cada dia do mês que possui tarefas, retorna:
     *   - total de tarefas
     *   - total de concluídas
     *   - porcentagem de conclusão (0–100)
     *   - cor do dia baseada na porcentagem
     *
     * Lógica de cor:
     *   100%      → GREEN
     *   70–99%    → LIGHT_GREEN  (intermediário útil — adicionado além do solicitado)
     *   50–69%    → YELLOW
     *   1–49%     → RED
     *   sem tasks → NONE
     */
    public Map<String, DaySummaryResponse> getMonthlySummary(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        List<Object[]> rows = taskRepository.findDailySummary(start, end);

        Map<String, DaySummaryResponse> summary = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDate date  = (LocalDate) row[0];
            long total      = (Long) row[1];
            long completed  = (Long) row[2];

            double percentage = total == 0 ? 0 : (completed * 100.0) / total;
            String color = resolveColor(percentage, total);

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

    // ──────────────────────────────────────────────
    // Utilitários privados
    // ──────────────────────────────────────────────

    private String resolveColor(double percentage, long total) {
        if (total == 0) return "NONE";
        if (percentage == 100) return "GREEN";
        if (percentage >= 70)  return "LIGHT_GREEN";
        if (percentage >= 50)  return "YELLOW";
        return "RED";
    }

    private Task findOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada: " + id));
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
