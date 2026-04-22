package com.todocalendar.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long   userId;
    private String name;
    private String email;
    private String profileImageUrl;
}
