package io.github.dezsoab.chefie.admin;

import io.github.dezsoab.chefie.event.EventService;
import io.github.dezsoab.chefie.menu.MenuAdminService;
import io.github.dezsoab.chefie.order.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventDeletionService {
    private final EventService eventService;
    private final OrderService orderService;
    private final MenuAdminService menuAdminService;

    public EventDeletionService(EventService eventService, OrderService orderService, MenuAdminService menuAdminService) {
        this.eventService = eventService;
        this.orderService = orderService;
        this.menuAdminService = menuAdminService;
    }

    @Transactional
    public void delete(Long eventId) {
        eventService.ensureDeletable(eventId);
        orderService.deleteAllForEvent(eventId);
        menuAdminService.deleteAllForEvent(eventId);
        eventService.delete(eventId);
    }
}
