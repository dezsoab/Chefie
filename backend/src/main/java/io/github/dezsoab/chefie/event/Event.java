package io.github.dezsoab.chefie.event;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "event")
public class Event {

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.DRAFT;

    @Column(nullable = false)
    private int lastOrderNumber = 0;

    protected Event() {
    }

    public Event(String name) {
        this.name = name;
    }

    public int nextOrderNumber() {
        this.lastOrderNumber++;
        return lastOrderNumber;
    }

    public void open() {
        if (status == EventStatus.OPEN) {
            return;
        }
        status = EventStatus.OPEN;
    }

    public void hold() {
        status = EventStatus.ON_HOLD;
    }

    public void close() {
        status = EventStatus.CLOSED;
    }

    public Long getId() {
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

    public Integer getLastOrderNumber() {
        return lastOrderNumber;
    }
}
