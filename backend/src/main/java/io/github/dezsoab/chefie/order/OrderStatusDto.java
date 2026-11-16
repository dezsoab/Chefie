package io.github.dezsoab.chefie.order;

public record OrderStatusDto(Long id, int number, String itemName, OrderStatus orderStatus, int ordersAhead) {
}
