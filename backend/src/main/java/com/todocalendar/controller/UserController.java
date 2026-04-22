package com.todocalendar.controller;

import com.todocalendar.dto.user.ChangePasswordRequest;
import com.todocalendar.dto.user.UpdateProfileRequest;
import com.todocalendar.dto.user.UserProfileResponse;
import com.todocalendar.entity.User;
import com.todocalendar.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me
     * Retorna o perfil do usuário autenticado.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getProfile(currentUser.getId()));
    }

    /**
     * PUT /api/users/me
     * Atualiza nome e/ou e-mail do usuário autenticado.
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), request));
    }

    /**
     * PUT /api/users/me/password
     * Altera a senha do usuário autenticado.
     * Exige senha atual correta + nova senha + confirmação.
     */
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso"));
    }
}
