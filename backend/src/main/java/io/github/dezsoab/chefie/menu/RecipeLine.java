package io.github.dezsoab.chefie.menu;

import jakarta.persistence.*;

@Entity
@Table(name = "recipe_line")
public class RecipeLine {
    @EmbeddedId
    private RecipeLineId id;

    @MapsId("menuItemId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @MapsId("ingredientId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    private int amount;

    public RecipeLine(RecipeLineId id, MenuItem menuItem, Ingredient ingredient, int amount) {
        this.id = id;
        this.menuItem = menuItem;
        this.ingredient = ingredient;
        this.amount = amount;
    }

    public RecipeLine() {
    }

    public RecipeLineId getId() {
        return id;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public int getAmount() {
        return amount;
    }
}

