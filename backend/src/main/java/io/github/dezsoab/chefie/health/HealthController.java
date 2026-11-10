package io.github.dezsoab.chefie.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api")
public class HealthController {
    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        String database;
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            database = "UP";
        } catch (Exception e) {
            database = "DOWN";
        }
        return new HealthResponse("UP", database, Instant.now());
    }
}
