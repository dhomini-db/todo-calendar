package com.todocalendar.service;

import com.todocalendar.dto.social.UserRankingResponse;
import com.todocalendar.entity.User;
import com.todocalendar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final UserRepository userRepository;

    /**
     * Returns the top 20 users ordered by currentStreak desc, bestStreak desc.
     * Users with currentStreak = 0 are included at the bottom (natural sort order).
     * Rank is 1-based.
     */
    public List<UserRankingResponse> getGlobalRankings() {
        List<User> topUsers = userRepository.findTop20ByOrderByCurrentStreakDescBestStreakDesc();

        AtomicInteger rankCounter = new AtomicInteger(1);
        return topUsers.stream()
                .map(user -> new UserRankingResponse(
                        user.getId(),
                        user.getName(),
                        extractInitial(user.getName()),
                        user.getCurrentStreak(),
                        user.getBestStreak(),
                        rankCounter.getAndIncrement()
                ))
                .collect(Collectors.toList());
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private String extractInitial(String name) {
        if (name == null || name.isBlank()) {
            return "?";
        }
        return String.valueOf(name.strip().charAt(0)).toUpperCase();
    }
}
