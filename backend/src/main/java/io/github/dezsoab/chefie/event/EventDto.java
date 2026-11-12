package io.github.dezsoab.chefie.event;

import java.time.Instant;

public record EventDto(Long id, String name, EventStatus status, Instant createdAt) {
    public static EventDto from(Event event) {
        return new EventDto(event.getId(), event.getName(), event.getStatus(), event.getCreatedAt());
    }
}
