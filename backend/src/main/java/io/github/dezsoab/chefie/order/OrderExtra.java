package io.github.dezsoab.chefie.order;

import io.github.dezsoab.chefie.menu.Ingredient;
import jakarta.persistence.*;

@Entity
@Table(name = "order_extra")
public class OrderExtra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id")
    private CustomerOrder order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @Column(nullable = false)
    private int amount;

    protected OrderExtra() {
    }

    public OrderExtra(CustomerOrder order, Ingredient ingredient, int amount) {
        this.order = order;
        this.ingredient = ingredient;
        this.amount = amount;
    }

    public Long getId() {
        return id;
    }

    public CustomerOrder getOrder() {
        return order;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public int getAmount() {
        return amount;
    }
}
