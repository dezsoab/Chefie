package io.github.dezsoab.chefie.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PlaceOrderRequest(@NotNull Long menuItemId, @NotBlank String guestName, String note) {
}
