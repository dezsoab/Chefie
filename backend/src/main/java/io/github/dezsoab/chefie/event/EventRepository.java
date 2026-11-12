package io.github.dezsoab.chefie.event;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findFirstByStatus(EventStatus status);

    Event name(String name);

}
