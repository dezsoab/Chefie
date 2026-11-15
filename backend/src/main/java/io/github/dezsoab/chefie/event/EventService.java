package io.github.dezsoab.chefie.event;

import io.github.dezsoab.chefie.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {
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

    public Event getOpenEvent() {
        return eventRepository.findFirstByStatus(EventStatus.OPEN)
                .orElseThrow(() -> new NotFoundException("No open event"));
    }

    @Transactional(readOnly = true)
    public EventDto findCurrent() {
        return EventDto.from(getOpenEvent());
    }

    @Transactional
    public EventDto create(String name) {
        Event event = eventRepository.save(new Event(name));
        return EventDto.from(event);
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
        eventRepository.findFirstByStatus(EventStatus.OPEN)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(Event::close);

        event.open();
        return EventDto.from(event);
    }

    public int nextOrderNumber(Long eventId) {
        Event event = eventRepository.findLockedById(eventId).orElseThrow(() -> new NotFoundException("Event not found"));
        return event.nextOrderNumber();
    }
}
