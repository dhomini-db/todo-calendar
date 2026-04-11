package com.todocalendar.controller;

import com.todocalendar.dto.TaskTemplateRequest;
import com.todocalendar.dto.TaskTemplateResponse;
import com.todocalendar.entity.User;
import com.todocalendar.service.TaskTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TaskTemplateController {

    private final TaskTemplateService templateService;

    @GetMapping
    public List<TaskTemplateResponse> listAll(
            @AuthenticationPrincipal User currentUser) {
        return templateService.listAll(currentUser.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskTemplateResponse create(
            @Valid @RequestBody TaskTemplateRequest req,
            @AuthenticationPrincipal User currentUser) {
        return templateService.create(req, currentUser.getId());
    }

    @PutMapping("/{id}")
    public TaskTemplateResponse update(
            @PathVariable Long id,
            @Valid @RequestBody TaskTemplateRequest req,
            @AuthenticationPrincipal User currentUser) {
        return templateService.update(id, req, currentUser.getId());
    }

    @PatchMapping("/{id}/toggle")
    public TaskTemplateResponse toggleActive(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return templateService.toggleActive(id, currentUser.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        templateService.delete(id, currentUser.getId());
    }
}
