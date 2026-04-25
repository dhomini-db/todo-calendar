package com.todocalendar.dto.social;

public record FollowUserResponse(
        Long   id,
        String name,
        String initial,
        String profileImageUrl,
        String bio,
        boolean isFollowing
) {}
