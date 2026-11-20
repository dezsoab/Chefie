package io.github.dezsoab.chefie.order;

import io.github.dezsoab.chefie.common.NotFoundException;
import io.github.dezsoab.chefie.event.Event;
import io.github.dezsoab.chefie.event.EventService;
import io.github.dezsoab.chefie.menu.Ingredient;
import io.github.dezsoab.chefie.menu.MenuItem;
import io.github.dezsoab.chefie.menu.MenuService;
import io.github.dezsoab.chefie.menu.Portion;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderExtraRepository orderExtraRepository;
    private final EventService eventService;
    private final MenuService menuService;

    public OrderService(OrderRepository orderRepository, OrderExtraRepository orderExtraRepository,
                        EventService eventService, MenuService menuService) {
        this.orderRepository = orderRepository;
        this.orderExtraRepository = orderExtraRepository;
        this.eventService = eventService;
        this.menuService = menuService;
    }

    @Transactional
    public OrderCreatedResponse placeOrder(PlaceOrderRequest placeOrderRequest) {
        Event openEvent = eventService.getOpenEvent();
        MenuItem orderableMenuItem = menuService.getOrderableMenuItem(placeOrderRequest.menuItemId(), openEvent);
        List<Ingredient> extras = menuService.getOrderableExtras(placeOrderRequest.extraIngredientIds(), openEvent);

        menuService.reserveStock(orderableMenuItem, extras);

        CustomerOrder customerOrder = orderRepository.save(new CustomerOrder(openEvent, orderableMenuItem, eventService.nextOrderNumber(openEvent.getId()), placeOrderRequest.guestName(), placeOrderRequest.note()));
        orderExtraRepository.saveAll(extras.stream()
                .map(extra -> new OrderExtra(customerOrder, extra, extra.getExtraAmount()))
                .toList());

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

        return new OrderStatusDto(customerOrder.getId(), customerOrder.getEvent().getId(), customerOrder.getNumber(), customerOrder.getMenuItem().getName(), customerOrder.getStatus(), ordersAhead);
    }

    @Transactional(readOnly = true)
    public List<KitchenOrderDto> getKitchenOrders() {
        Event openEvent = eventService.getActiveEvent();
        List<CustomerOrder> activeOrdersForKitchen = orderRepository.findActiveForKitchen(openEvent.getId(), List.of(OrderStatus.QUEUED, OrderStatus.COOKING, OrderStatus.READY));
        Map<Long, List<Portion>> extrasByOrder = extrasByOrder(activeOrdersForKitchen.stream().map(CustomerOrder::getId).toList());
        Map<Long, List<Portion>> recipes = menuService.getPortionsByMenuItem(openEvent.getId());

        return activeOrdersForKitchen.stream()
                .map(order -> toKitchenDto(order,
                        recipes.getOrDefault(order.getMenuItem().getId(), List.of()),
                        extrasByOrder.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @Transactional
    public KitchenOrderDto changeStatus(Long id, OrderStatus nextOrderStatus) {
        CustomerOrder customerOrder = orderRepository.findById(id).orElseThrow(() -> new NotFoundException("Customer order not found."));

        customerOrder.changeStatus(nextOrderStatus);

        List<OrderExtra> extras = orderExtraRepository.findWithIngredientByOrderIds(List.of(id));

        if (nextOrderStatus == OrderStatus.CANCELLED) {
            menuService.releaseStock(customerOrder.getMenuItem());
            for (OrderExtra extra : extras) {
                menuService.releaseIngredient(extra.getIngredient().getId(), extra.getAmount());
            }
        }

        List<Portion> recipe = menuService.getPortionsByMenuItem(customerOrder.getEvent().getId())
                .getOrDefault(customerOrder.getMenuItem().getId(), List.of());
        return toKitchenDto(customerOrder, recipe, extras.stream().map(this::toPortion).toList());
    }

    private Map<Long, List<Portion>> extrasByOrder(List<Long> orderIds) {
        if (orderIds.isEmpty()) {
            return Map.of();
        }

        return orderExtraRepository.findWithIngredientByOrderIds(orderIds).stream()
                .collect(Collectors.groupingBy(
                        extra -> extra.getOrder().getId(),
                        Collectors.mapping(this::toPortion, Collectors.toList())));
    }

    private Portion toPortion(OrderExtra extra) {
        return new Portion(extra.getIngredient().getName(), extra.getAmount(), extra.getIngredient().getUnit());
    }

    private KitchenOrderDto toKitchenDto(CustomerOrder order, List<Portion> recipe, List<Portion> extras) {
        return new KitchenOrderDto(order.getId(), order.getNumber(), order.getGuestName(), order.getNote(),
                order.getMenuItem().getName(), recipe, extras, order.getStatus(), order.getCreatedAt());
    }
}
