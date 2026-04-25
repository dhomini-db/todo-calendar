package com.todocalendar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

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

    /**
     * RestTemplate with a 30-second timeout for outbound HTTP calls (Anthropic API).
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000); // 10s connect
        factory.setReadTimeout(30_000);    // 30s read (Claude can be slow)
        return new RestTemplate(factory);
    }
}
