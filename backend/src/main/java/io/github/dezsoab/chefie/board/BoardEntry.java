package io.github.dezsoab.chefie.board;

import io.github.dezsoab.chefie.order.OrderStatus;

public record BoardEntry(int number, String guestName, String itemName, OrderStatus orderStatus) {
}
