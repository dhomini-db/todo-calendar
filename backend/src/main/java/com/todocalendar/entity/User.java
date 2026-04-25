package com.todocalendar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ── Streak ─────────────────────────────────────────────────

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private int currentStreak = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private int bestStreak = 0;

    @Column
    private LocalDate lastCompletedDate;

    // ── Foto de perfil ─────────────────────────────────────────
    // Armazenada como data URI base64 (ex: "data:image/png;base64,...")
    // TEXT suporta até ~1GB no PostgreSQL — suficiente para imagens até 2MB.

    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    // ── Bio pública ─────────────────────────────────────────────

    @Column(name = "bio", length = 160)
    private String bio;

    // ── Banner de perfil ────────────────────────────────────────

    @Column(name = "banner_image_url", columnDefinition = "TEXT")
    private String bannerImageUrl;

    // ── UserDetails ────────────────────────────────────────────
    // Sem roles por ora: todos os usuários têm o mesmo nível de acesso.

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return email; // Spring Security usa o e-mail como identificador único
    }

    @Override
    public boolean isAccountNonExpired()  { return true; }

    @Override
    public boolean isAccountNonLocked()   { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
