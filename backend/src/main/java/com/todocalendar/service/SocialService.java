package com.todocalendar.service;

import com.todocalendar.dto.social.FollowUserResponse;
import com.todocalendar.dto.social.PublicProfileResponse;
import com.todocalendar.dto.social.UserRankingResponse;
import com.todocalendar.entity.Follow;
import com.todocalendar.entity.User;
import com.todocalendar.repository.FollowRepository;
import com.todocalendar.repository.TaskRepository;
import com.todocalendar.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final UserRepository   userRepository;
    private final FollowRepository followRepository;
    private final TaskRepository   taskRepository;

    // ── Rankings ───────────────────────────────────────────────────────────────

    /**
     * Top-20 global leaderboard with follow status for the requesting user.
     */
    public List<UserRankingResponse> getGlobalRankings(Long currentUserId) {
        List<User> topUsers = userRepository.findTop20ByOrderByCurrentStreakDescBestStreakDesc();

        // Fetch all IDs that currentUser follows in one query
        Set<Long> followingIds = Set.copyOf(followRepository.findFollowingIdsByFollowerId(currentUserId));

        AtomicInteger rank = new AtomicInteger(1);
        return topUsers.stream()
                .map(u -> new UserRankingResponse(
                        u.getId(),
                        u.getName(),
                        extractInitial(u.getName()),
                        u.getCurrentStreak(),
                        u.getBestStreak(),
                        rank.getAndIncrement(),
                        followingIds.contains(u.getId()),
                        followRepository.countByFollowingId(u.getId()),
                        u.getProfileImageUrl()
                ))
                .collect(Collectors.toList());
    }

    // ── Public Profile ─────────────────────────────────────────────────────────

    public PublicProfileResponse getPublicProfile(Long profileUserId, Long currentUserId) {
        User u = userRepository.findById(profileUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + profileUserId));

        long completed  = taskRepository.countAllTimeCompletedByUser(profileUserId);
        long followers  = followRepository.countByFollowingId(profileUserId);
        long following  = followRepository.countByFollowerId(profileUserId);
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(currentUserId, profileUserId);

        return new PublicProfileResponse(
                u.getId(),
                u.getName(),
                extractInitial(u.getName()),
                u.getBio(),
                u.getCurrentStreak(),
                u.getBestStreak(),
                completed,
                isFollowing,
                followers,
                following,
                u.getProfileImageUrl(),
                u.getBannerImageUrl(),
                u.getBannerPosition()
        );
    }

    // ── Followers / Following lists ────────────────────────────────────────────

    public List<FollowUserResponse> getFollowers(Long profileUserId, Long currentUserId) {
        List<User> followers = followRepository.findFollowersByUserId(profileUserId);
        Set<Long> followingIds = Set.copyOf(followRepository.findFollowingIdsByFollowerId(currentUserId));
        return followers.stream()
                .map(u -> new FollowUserResponse(
                        u.getId(),
                        u.getName(),
                        extractInitial(u.getName()),
                        u.getProfileImageUrl(),
                        u.getBio(),
                        followingIds.contains(u.getId())
                ))
                .collect(Collectors.toList());
    }

    public List<FollowUserResponse> getFollowing(Long profileUserId, Long currentUserId) {
        List<User> following = followRepository.findFollowingByUserId(profileUserId);
        Set<Long> followingIds = Set.copyOf(followRepository.findFollowingIdsByFollowerId(currentUserId));
        return following.stream()
                .map(u -> new FollowUserResponse(
                        u.getId(),
                        u.getName(),
                        extractInitial(u.getName()),
                        u.getProfileImageUrl(),
                        u.getBio(),
                        followingIds.contains(u.getId())
                ))
                .collect(Collectors.toList());
    }

    // ── Follow / Unfollow ──────────────────────────────────────────────────────

    @Transactional
    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) return; // can't follow yourself

        // Upsert — ignore if already following
        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            User follower  = userRepository.getReferenceById(followerId);
            User following = userRepository.getReferenceById(followingId);
            Follow.FollowId id = new Follow.FollowId(followerId, followingId);
            followRepository.save(Follow.builder().id(id).follower(follower).following(following).build());
        }
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private String extractInitial(String name) {
        if (name == null || name.isBlank()) return "?";
        return String.valueOf(name.strip().charAt(0)).toUpperCase();
    }
}
