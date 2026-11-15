package io.github.dezsoab.chefie.order;

import io.github.dezsoab.chefie.event.Event;
import io.github.dezsoab.chefie.event.EventService;
import io.github.dezsoab.chefie.menu.MenuItem;
import io.github.dezsoab.chefie.menu.MenuService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final EventService eventService;
    private final MenuService menuService;

    public OrderService(OrderRepository orderRepository, EventService eventService, MenuService menuService) {
        this.orderRepository = orderRepository;
        this.eventService = eventService;
        this.menuService = menuService;
    }

    @Transactional
    public OrderCreatedResponse placeOrder(PlaceOrderRequest placeOrderRequest) {
        Event openEvent = eventService.getOpenEvent();

        MenuItem orderdableMenuItem = menuService.getOrderableMenuItem(placeOrderRequest.menuItemId(), openEvent);
        CustomerOrder customerOrder = orderRepository.save(new CustomerOrder(openEvent, orderdableMenuItem, eventService.nextOrderNumber(openEvent.getId()), placeOrderRequest.guestName(), placeOrderRequest.note()));

        return new OrderCreatedResponse(customerOrder.getId(), customerOrder.getNumber(), customerOrder.getGuestToken());
    }
}
