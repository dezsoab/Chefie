package io.github.dezsoab.chefie.order;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderCreatedResponse placeOrder(@Valid @RequestBody PlaceOrderRequest placeOrderRequest) {
        return orderService.placeOrder(placeOrderRequest);
    }

    @GetMapping("/{id}")
    public OrderStatusDto getOrderStatus(@PathVariable Long id, @RequestHeader("X-Order-Token") UUID guestToken) {
        return orderService.getOrderStatus(id, guestToken);
    }
}
