package io.github.dezsoab.chefie.menu;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;

public final class MenuAdminDtos {

    private MenuAdminDtos() {
    }

    public record IngredientDto(Long id, String name, String unit, Integer stock, Integer extraAmount, long version) {
        static IngredientDto from(Ingredient ingredient) {
            return new IngredientDto(ingredient.getId(), ingredient.getName(), ingredient.getUnit(),
                    ingredient.getStock(), ingredient.getExtraAmount(), ingredient.getVersion());
        }
    }

    public record RecipeLineDto(Long ingredientId, String ingredientName, String unit, int amount) {
    }

    public record MenuItemDto(Long id, String name, boolean enabled, List<RecipeLineDto> lines) {
    }

    public record MenuDto(Long id, String name, List<MenuItemDto> items) {
    }

    public record SetupDto(Long eventId, String eventName, List<IngredientDto> ingredients, List<MenuDto> menus) {
    }

    public record IngredientRequest(@NotBlank String name, @NotBlank String unit, @PositiveOrZero Integer stock,
                                    @Positive Integer extraAmount, Long version) {
    }

    public record StockAdjustRequest(int delta) {
    }

    public record MenuRequest(@NotBlank String name) {
    }

    public record RecipeLineRequest(@NotNull Long ingredientId, @Positive int amount) {
    }

    public record MenuItemRequest(@NotBlank String name, boolean enabled, @NotNull List<@Valid RecipeLineRequest> lines) {
    }
}
