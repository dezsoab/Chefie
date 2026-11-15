package io.github.dezsoab.chefie.order;

import java.util.UUID;

public record OrderCreatedResponse(Long id, int number, UUID guestToken) {
}
