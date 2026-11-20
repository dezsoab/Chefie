package io.github.dezsoab.chefie.event;

import io.github.dezsoab.chefie.common.ConflictException;
import io.github.dezsoab.chefie.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {
    private static final List<EventStatus> ACTIVE = List.of(EventStatus.ON_HOLD, EventStatus.OPEN);

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public List<EventDto> findAll() {
        return eventRepository.findAll()
                .stream()
                .map(EventDto::from)
                .toList();
    }

    public Event getActiveEvent() {
        return eventRepository.findFirstByStatusIn(ACTIVE)
                .orElseThrow(() -> new NotFoundException("No active event"));
    }

    public Event getOpenEvent() {
        return eventRepository.findFirstByStatus(EventStatus.OPEN)
                .orElseThrow(() -> new ConflictException("The kitchen isn't taking orders right now."));
    }

    @Transactional(readOnly = true)
    public EventDto findCurrent() {
        return EventDto.from(getActiveEvent());
    }

    @Transactional
    public EventDto create(String name) {
        Event event = eventRepository.save(new Event(name));
        return EventDto.from(event);
    }

    public Event getEvent(Long id) {
        return findEventOrThrow(id);
    }

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new NotFoundException("Event " + id + " not found."));
    }

    @Transactional
    public EventDto close(Long id) {
        Event event = findEventOrThrow(id);
        event.close();
        return EventDto.from(event);
    }

    @Transactional
    public EventDto open(Long id) {
        Event event = findEventOrThrow(id);
        closeOtherActiveEvents(id);
        event.open();
        return EventDto.from(event);
    }

    @Transactional
    public EventDto hold(Long id) {
        Event event = findEventOrThrow(id);
        closeOtherActiveEvents(id);
        event.hold();
        return EventDto.from(event);
    }

    public int nextOrderNumber(Long eventId) {
        Event event = eventRepository.findLockedById(eventId).orElseThrow(() -> new NotFoundException("Event not found"));
        return event.nextOrderNumber();
    }

    private void closeOtherActiveEvents(Long id) {
        eventRepository.findByStatusIn(ACTIVE).stream()
                .filter(other -> !other.getId().equals(id))
                .forEach(Event::close);
    }
}
