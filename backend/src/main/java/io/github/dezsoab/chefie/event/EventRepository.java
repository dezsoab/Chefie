package io.github.dezsoab.chefie.event;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findFirstByStatus(EventStatus status);

    Event name(String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Event> findLockedById(Long id);
}
