package com.todocalendar.controller;

import com.todocalendar.entity.User;
import com.todocalendar.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    /**
     * GET /api/export/tasks
     * Retorna um arquivo CSV com todas as tarefas do usuário autenticado,
     * ordenadas por data decrescente. Pronto para download via browser.
     */
    @GetMapping("/tasks")
    public ResponseEntity<byte[]> exportTasks(@AuthenticationPrincipal User currentUser) {
        byte[] csv      = exportService.generateTasksCsv(currentUser.getId());
        String filename = "taskflow-" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(csv.length)
                .body(csv);
    }
}
