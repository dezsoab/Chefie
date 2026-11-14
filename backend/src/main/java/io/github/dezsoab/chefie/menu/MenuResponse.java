package io.github.dezsoab.chefie.menu;

import java.util.List;

public record MenuResponse(Long eventId, String eventName, List<MenuDto> menus, List<ExtraDto> extras) {

    public record MenuDto(Long id, String name, List<MenuItemDto> items) {
    }

    public record MenuItemDto(Long id, String name, String description, List<String> ingredients, int available) {
    }

    public record ExtraDto(Long ingredientId, String name, int available) {
    }
}