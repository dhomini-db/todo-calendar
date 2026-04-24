package com.todocalendar.controller;

import com.todocalendar.dto.social.UserRankingResponse;
import com.todocalendar.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    /**
     * GET /api/social/rankings
     * Returns the top 20 users ranked by streak. Requires a valid JWT.
     */
    @GetMapping("/rankings")
    public List<UserRankingResponse> getRankings() {
        return socialService.getGlobalRankings();
    }
}
