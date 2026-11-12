package io.github.dezsoab.chefie.event;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {
    private final EventService eventService;

    public AdminEventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventDto create(@Valid @RequestBody CreateEventRequest createEventRequest) {
        return eventService.create(createEventRequest.name());
    }

    @PostMapping("/{id}/open")
    public EventDto open(@PathVariable Long id) {
        return eventService.open(id);
    }

    @PostMapping("/{id}/close")
    public EventDto close(@PathVariable Long id) {
        return eventService.close(id);
    }
}
