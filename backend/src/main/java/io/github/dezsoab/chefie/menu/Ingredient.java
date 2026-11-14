package io.github.dezsoab.chefie.menu;

import io.github.dezsoab.chefie.event.Event;
import jakarta.persistence.*;

@Entity
@Table(name = "ingredient")
public class Ingredient {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id")
    private Event event;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String unit;
    private Integer stock;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer extraAmount;

    @Version
    private long version;

    public Ingredient(Event event_id, String name, String unit, Integer stock) {
        this.event = event_id;
        this.name = name;
        this.unit = unit;
        this.stock = stock;
    }

    public Ingredient() {

    }
}
