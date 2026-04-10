package com.todocalendar.controller;

import com.todocalendar.dto.DaySummaryResponse;
import com.todocalendar.dto.TaskRequest;
import com.todocalendar.dto.TaskResponse;
import com.todocalendar.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller REST que expõe os endpoints da API de tarefas.
 *
 * Endpoints:
 *   GET    /api/tasks?date=2024-04-10       → tarefas do dia
 *   POST   /api/tasks                        → criar tarefa
 *   PUT    /api/tasks/{id}                   → atualizar tarefa
 *   PATCH  /api/tasks/{id}/toggle            → alternar conclusão
 *   DELETE /api/tasks/{id}                   → excluir tarefa
 *   GET    /api/tasks/summary?year=&month=   → resumo mensal com cores
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(taskService.getTasksByDate(date));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleCompletion(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, DaySummaryResponse>> summary(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(taskService.getMonthlySummary(year, month));
    }
}
