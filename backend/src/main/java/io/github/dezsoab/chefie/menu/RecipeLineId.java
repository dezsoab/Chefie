package io.github.dezsoab.chefie.menu;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecipeLineId implements Serializable {
    @Column(name = "menu_item_id")
    private Long menuItemId;

    @Column(name = "ingredient_id")
    private Long ingredientId;

    public RecipeLineId(Long menuItemId, Long ingredientId) {
        this.menuItemId = menuItemId;
        this.ingredientId = ingredientId;
    }

    public RecipeLineId() {
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        RecipeLineId that = (RecipeLineId) o;
        return Objects.equals(menuItemId, that.menuItemId) && Objects.equals(ingredientId, that.ingredientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(menuItemId, ingredientId);
    }
}
