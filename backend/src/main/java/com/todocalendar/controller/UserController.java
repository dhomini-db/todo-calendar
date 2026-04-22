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
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    /**
     * POST /api/users/me/avatar
     * Faz upload da foto de perfil (JPG, PNG ou WebP — máx 2 MB).
     * A imagem é convertida para data URI base64 e salva no banco.
     */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.uploadAvatar(currentUser, file));
    }

    /**
     * DELETE /api/users/me/avatar
     * Remove a foto de perfil do usuário autenticado (volta ao avatar padrão).
     */
    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserProfileResponse> removeAvatar(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.removeAvatar(currentUser));
    }
}
