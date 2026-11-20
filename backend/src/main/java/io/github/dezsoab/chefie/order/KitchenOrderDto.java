package io.github.dezsoab.chefie.order;

import io.github.dezsoab.chefie.menu.Portion;

import java.time.Instant;
import java.util.List;

public record KitchenOrderDto(Long id, int number, String guestName, String note, String itemName,
                              List<Portion> recipe, List<Portion> extras, OrderStatus status, Instant createdAt) {
}
