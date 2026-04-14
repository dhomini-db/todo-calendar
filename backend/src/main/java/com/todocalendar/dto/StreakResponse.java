package com.todocalendar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreakResponse {

    private int currentStreak;
    private int bestStreak;
    private String lastCompletedDate;   // "yyyy-MM-dd" ou null
    private boolean completedToday;

    /** Status dos 7 dias da semana atual (Seg–Dom) */
    private List<DayStatus> weekDays;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayStatus {
        private String date;       // "yyyy-MM-dd"
        private String dayName;    // "Seg", "Ter", ...
        private boolean completed; // atingiu >= 70%
        private boolean isToday;
        private boolean isFuture;
    }
}
