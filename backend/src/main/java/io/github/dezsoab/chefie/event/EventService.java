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
                .orElseThrow(() -> new NotFoundException("NO_ACTIVE_EVENT"));
    }

    public Event getOpenEvent() {
        return eventRepository.findFirstByStatus(EventStatus.OPEN)
                .orElseThrow(() -> new ConflictException("KITCHEN_CLOSED"));
    }

    @Transactional(readOnly = true)
    public EventDto findCurrent() {
        return EventDto.from(getActiveEvent());
    }

    @Transactional
    public EventDto create(String name, String language) {
        Event event = eventRepository.save(new Event(name.trim(), language));
        return EventDto.from(event);
    }

    @Transactional
    public EventDto changeLanguage(Long id, String language) {
        Event event = findEventOrThrow(id);
        event.changeLanguage(language);
        return EventDto.from(event);
    }

    public Event getEvent(Long id) {
        return findEventOrThrow(id);
    }

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new NotFoundException("EVENT_NOT_FOUND"));
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

    @Transactional
    public void delete(Long id) {
        eventRepository.delete(findEventOrThrow(id));
    }

    public void ensureDeletable(Long id) {
        Event event = findEventOrThrow(id);
        if (ACTIVE.contains(event.getStatus())) {
            throw new ConflictException("EVENT_ACTIVE");
        }
    }

    public int nextOrderNumber(Long eventId) {
        Event event = eventRepository.findLockedById(eventId).orElseThrow(() -> new NotFoundException("EVENT_NOT_FOUND"));
        return event.nextOrderNumber();
    }

    private void closeOtherActiveEvents(Long id) {
        eventRepository.findByStatusIn(ACTIVE).stream()
                .filter(other -> !other.getId().equals(id))
                .forEach(Event::close);
    }
}
