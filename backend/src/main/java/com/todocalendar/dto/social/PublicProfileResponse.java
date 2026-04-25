package com.todocalendar.dto.social;

public record PublicProfileResponse(
        Long    id,
        String  name,
        String  initial,
        String  bio,
        int     currentStreak,
        int     bestStreak,
        long    totalTasksCompleted,
        boolean isFollowing,
        long    followersCount,
        long    followingCount,
        String  profileImageUrl,
        String  bannerImageUrl
) {}
