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

    public Ingredient(Event event, String name, String unit, Integer stock, Integer extraAmount) {
        this.event = event;
        this.name = name;
        this.unit = unit;
        this.stock = stock;
        this.extraAmount = extraAmount;
    }

    protected Ingredient() {
    }

    public void update(String name, String unit, Integer stock, Integer extraAmount) {
        this.name = name;
        this.unit = unit;
        this.stock = stock;
        this.extraAmount = extraAmount;
    }

    public Event getEvent() {
        return event;
    }

    public String getName() {
        return name;
    }

    public String getUnit() {
        return unit;
    }

    public Integer getStock() {
        return stock;
    }

    public Long getId() {
        return id;
    }

    public Integer getExtraAmount() {
        return extraAmount;
    }

    public long getVersion() {
        return version;
    }
}
