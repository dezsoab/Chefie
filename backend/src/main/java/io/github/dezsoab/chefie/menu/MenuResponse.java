package io.github.dezsoab.chefie.menu;

import java.util.List;

public record MenuResponse(Long eventId, String eventName, boolean open, List<MenuDto> menus, List<ExtraDto> extras) {

    public record MenuDto(Long id, String name, List<MenuItemDto> items) {
    }

    public record MenuItemDto(Long id, String name, String description, List<String> ingredients,
                              List<RecipeNeedDto> recipe, Integer available) {
    }

    public record RecipeNeedDto(Long ingredientId, int amount) {
    }

    public record ExtraDto(Long ingredientId, String name, Integer available, Integer stock, int extraAmount) {
    }
}