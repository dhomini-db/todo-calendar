package com.todocalendar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Beans de configuração geral.
 * PasswordEncoder aqui (e não em SecurityConfig) para evitar ciclo:
 * SecurityConfig → JwtAuthFilter → UserService → SecurityConfig.
 */
@Configuration
public class AppConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
