package com.todocalendar.controller;

import com.todocalendar.dto.DaySummaryResponse;
import com.todocalendar.dto.TaskRequest;
import com.todocalendar.dto.TaskResponse;
import com.todocalendar.entity.User;
import com.todocalendar.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // O userId vem sempre do token JWT via @AuthenticationPrincipal — nunca do frontend.

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getTasksByDate(date, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(request, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.updateTask(id, request, currentUser.getId()));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponse> toggle(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.toggleCompletion(id, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        taskService.deleteTask(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, DaySummaryResponse>> summary(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getMonthlySummary(year, month, currentUser.getId()));
    }
}
