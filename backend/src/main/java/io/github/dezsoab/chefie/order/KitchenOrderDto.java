package io.github.dezsoab.chefie.order;

import java.time.Instant;

public record KitchenOrderDto(Long id, int number, String guestName, String note, String itemName,
                              OrderStatus status, Instant createdAt) {
}
