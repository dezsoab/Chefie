package io.github.dezsoab.chefie.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateEventRequest(@NotBlank String name, @Pattern(regexp = "en|de|hu") String language) {
}
