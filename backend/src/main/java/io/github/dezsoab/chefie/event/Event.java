package io.github.dezsoab.chefie.event;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "event")
public class Event {
    @Column(name = "created_at", nullable = false, updatable = false)
    private final Instant createdAt = Instant.now();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.DRAFT;

    protected Event() {
    }

    public Event(String name) {
        this.name = name;
    }

    public void open() {
        if (status == EventStatus.OPEN) {
            throw new IllegalStateException("Event is already open.");
        }
        status = EventStatus.OPEN;
    }

    public void close() {
        status = EventStatus.CLOSED;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public EventStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
