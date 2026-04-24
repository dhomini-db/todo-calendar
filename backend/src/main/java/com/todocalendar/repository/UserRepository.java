package com.todocalendar.repository;

import com.todocalendar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Returns the top 20 users ordered by currentStreak descending, then bestStreak descending.
     * Used by SocialService to build the global leaderboard.
     */
    List<User> findTop20ByOrderByCurrentStreakDescBestStreakDesc();
}
