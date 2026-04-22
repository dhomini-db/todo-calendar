package com.todocalendar.service;

import com.todocalendar.dto.auth.AuthResponse;
import com.todocalendar.dto.auth.LoginRequest;
import com.todocalendar.dto.auth.RegisterRequest;
import com.todocalendar.dto.user.ChangePasswordRequest;
import com.todocalendar.dto.user.UpdateProfileRequest;
import com.todocalendar.dto.user.UserProfileResponse;
import com.todocalendar.entity.User;
import com.todocalendar.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService      jwtService;

    // ── UserDetailsService (usado pelo Spring Security) ────────

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    }

    // ── Cadastro ───────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        return buildResponse(user);
    }

    // ── Login ──────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        return buildResponse(user);
    }

    // ── Perfil ─────────────────────────────────────────────────

    public UserProfileResponse getProfile(Long userId) {
        User user = findOrThrow(userId);
        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findOrThrow(userId);

        // Se o e-mail mudou, verificar unicidade
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("E-mail já está em uso por outro usuário");
            }
        }

        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        userRepository.save(user);

        return toProfileResponse(user);
    }

    // ── Alterar senha ──────────────────────────────────────────

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findOrThrow(userId);

        // 1. Verificar senha atual
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Senha atual incorreta");
        }

        // 2. Confirmação igual à nova senha
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IllegalArgumentException("A confirmação não coincide com a nova senha");
        }

        // 3. Nova senha não pode ser igual à atual
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da atual");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ── Utilitários privados ───────────────────────────────────

    private User findOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AuthResponse buildResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
