package com.todocalendar.dto.social;

public record UserRankingResponse(
        Long id,
        String name,
        String initial,
        int currentStreak,
        int bestStreak,
        int rank
) {}
