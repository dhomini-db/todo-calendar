package com.todocalendar.controller;

import com.todocalendar.dto.social.PublicProfileResponse;
import com.todocalendar.dto.social.UserRankingResponse;
import com.todocalendar.entity.User;
import com.todocalendar.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    /** GET /api/social/rankings — leaderboard with follow status */
    @GetMapping("/rankings")
    public List<UserRankingResponse> getRankings(@AuthenticationPrincipal User currentUser) {
        return socialService.getGlobalRankings(currentUser.getId());
    }

    /** GET /api/social/profile/{userId} — public profile of any user */
    @GetMapping("/profile/{userId}")
    public PublicProfileResponse getProfile(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        return socialService.getPublicProfile(userId, currentUser.getId());
    }

    /** POST /api/social/follow/{userId} — follow a user */
    @PostMapping("/follow/{userId}")
    public ResponseEntity<Void> follow(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        socialService.follow(currentUser.getId(), userId);
        return ResponseEntity.ok().build();
    }

    /** DELETE /api/social/follow/{userId} — unfollow a user */
    @DeleteMapping("/follow/{userId}")
    public ResponseEntity<Void> unfollow(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        socialService.unfollow(currentUser.getId(), userId);
        return ResponseEntity.ok().build();
    }
}
