package io.github.dezsoab.chefie.order;

import io.github.dezsoab.chefie.common.NotFoundException;
import io.github.dezsoab.chefie.event.Event;
import io.github.dezsoab.chefie.event.EventService;
import io.github.dezsoab.chefie.menu.MenuItem;
import io.github.dezsoab.chefie.menu.MenuService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
        MenuItem orderableMenuItem = menuService.getOrderableMenuItem(placeOrderRequest.menuItemId(), openEvent);

        menuService.reserveStock(orderableMenuItem);

        CustomerOrder customerOrder = orderRepository.save(new CustomerOrder(openEvent, orderableMenuItem, eventService.nextOrderNumber(openEvent.getId()), placeOrderRequest.guestName(), placeOrderRequest.note()));
        return new OrderCreatedResponse(customerOrder.getId(), customerOrder.getNumber(), customerOrder.getGuestToken());
    }

    @Transactional(readOnly = true)
    public OrderStatusDto getOrderStatus(Long id, UUID guestToken) {
        CustomerOrder customerOrder = orderRepository.findById(id).orElseThrow(() -> new NotFoundException("Order not found."));

        if (!guestToken.equals(customerOrder.getGuestToken())) {
            throw new NotFoundException("Order not found.");
        }

        int ordersAhead = 0;
        if (customerOrder.getStatus() == OrderStatus.QUEUED) {
            ordersAhead = (int) orderRepository.countByEventIdAndStatusInAndNumberLessThan(customerOrder.getEvent().getId(), List.of(OrderStatus.QUEUED, OrderStatus.COOKING), customerOrder.getNumber());
        }

        return new OrderStatusDto(customerOrder.getId(), customerOrder.getNumber(), customerOrder.getMenuItem().getName(), customerOrder.getStatus(), ordersAhead);
    }

    @Transactional(readOnly = true)
    public List<KitchenOrderDto> getKitchenOrders() {
        Event openEvent = eventService.getOpenEvent();
        List<CustomerOrder> activeOrdersForKitchen = orderRepository.findActiveForKitchen(openEvent.getId(), List.of(OrderStatus.QUEUED, OrderStatus.COOKING, OrderStatus.READY));

        return activeOrdersForKitchen.stream()
                .map(order -> new KitchenOrderDto(order.getId(), order.getNumber(), order.getGuestName(), order.getNote(), order.getMenuItem().getName(), order.getStatus(), order.getCreatedAt()))
                .toList();
    }
}