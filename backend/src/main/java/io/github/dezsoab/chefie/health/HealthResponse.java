package io.github.dezsoab.chefie.health;

import java.time.Instant;

public record HealthResponse(String status, String database, Instant time) {
}
