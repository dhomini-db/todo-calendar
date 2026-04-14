package com.todocalendar.controller;

import com.todocalendar.dto.StreakResponse;
import com.todocalendar.entity.User;
import com.todocalendar.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/streak")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;

    /**
     * Sincroniza e retorna o streak atual do usuário.
     * Chamado após cada toggle de tarefa e ao montar o componente.
     */
    @GetMapping
    public ResponseEntity<StreakResponse> getStreak(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(streakService.getAndSync(currentUser.getId()));
    }
}
