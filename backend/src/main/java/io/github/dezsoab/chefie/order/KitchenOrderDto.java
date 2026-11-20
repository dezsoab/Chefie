package io.github.dezsoab.chefie.order;

import java.time.Instant;
import java.util.List;

public record KitchenOrderDto(Long id, int number, String guestName, String note, String itemName,
                              List<String> extras, OrderStatus status, Instant createdAt) {
}
