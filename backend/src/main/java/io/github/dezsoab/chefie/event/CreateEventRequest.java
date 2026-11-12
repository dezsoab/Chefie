package io.github.dezsoab.chefie.event;

import jakarta.validation.constraints.NotBlank;

public record CreateEventRequest(@NotBlank String name) {
}
