package io.github.dezsoab.chefie.event;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record LanguageRequest(@NotNull @Pattern(regexp = "en|de|hu") String language) {
}
