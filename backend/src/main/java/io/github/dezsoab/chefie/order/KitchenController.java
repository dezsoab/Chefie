package io.github.dezsoab.chefie.order;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen/orders")
public class KitchenController {
    private final OrderService orderService;

    public KitchenController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<KitchenOrderDto> getKitchenOrders() {
        return orderService.getKitchenOrders();
    }
}
