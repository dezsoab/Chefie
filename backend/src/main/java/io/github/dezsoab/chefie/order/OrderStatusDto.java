package io.github.dezsoab.chefie.order;

public record OrderStatusDto(Long id, Long eventId, int number, String itemName, OrderStatus status, int ordersAhead) {
}
