package com.todocalendar.controller;

import com.todocalendar.dto.DashboardStatsResponse;
import com.todocalendar.dto.MonthlyPerformanceResponse;
import com.todocalendar.entity.User;
import com.todocalendar.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /**
     * GET /api/stats/dashboard
     * Retorna score de hoje, streak, contagens mensais e série dos últimos 30 dias.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboard(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(statsService.getDashboardStats(currentUser.getId()));
    }

    /**
     * GET /api/stats/monthly-performance
     * Retorna o desempenho médio do usuário para cada mês do ano corrente.
     * Meses futuros chegam com percentage = null.
     */
    @GetMapping("/monthly-performance")
    public ResponseEntity<List<MonthlyPerformanceResponse>> getMonthlyPerformance(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(statsService.getMonthlyPerformance(currentUser.getId()));
    }
}
