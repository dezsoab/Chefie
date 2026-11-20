package io.github.dezsoab.chefie.event;

import io.github.dezsoab.chefie.admin.EventDeletionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {
    private final EventService eventService;
    private final EventDeletionService eventDeletionService;

    public AdminEventController(EventService eventService, EventDeletionService eventDeletionService) {
        this.eventService = eventService;
        this.eventDeletionService = eventDeletionService;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        eventDeletionService.delete(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventDto create(@Valid @RequestBody CreateEventRequest createEventRequest) {
        return eventService.create(createEventRequest.name(), createEventRequest.language());
    }

    @PostMapping("/{id}/open")
    public EventDto open(@PathVariable Long id) {
        return eventService.open(id);
    }

    @PutMapping("/{id}/language")
    public EventDto changeLanguage(@PathVariable Long id, @Valid @RequestBody LanguageRequest request) {
        return eventService.changeLanguage(id, request.language());
    }

    @PostMapping("/{id}/hold")
    public EventDto hold(@PathVariable Long id) {
        return eventService.hold(id);
    }

    @PostMapping("/{id}/close")
    public EventDto close(@PathVariable Long id) {
        return eventService.close(id);
    }

    @GetMapping
    public List<EventDto> findAll() {
        return eventService.findAll();
    }
}
