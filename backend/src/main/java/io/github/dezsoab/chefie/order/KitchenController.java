package io.github.dezsoab.chefie.order;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/{id}/status")
    public KitchenOrderDto changeStatus(@PathVariable Long id, @Valid @RequestBody ChangeStatusRequest request) {
        return orderService.changeStatus(id, request.status());
    }
}
