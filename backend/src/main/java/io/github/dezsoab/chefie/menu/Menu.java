package io.github.dezsoab.chefie.menu;


import io.github.dezsoab.chefie.event.Event;
import jakarta.persistence.*;

@Entity
@Table(name = "menu")
public class Menu {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id")
    private Event event;
    @Column(nullable = false)
    private String name;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String description;

    private int sortOrder;

    public Menu(Event event, String name) {
        this.event = event;
        this.name = name;
    }

    public Menu() {

    }

    public Event getEvent() {
        return event;
    }

    public String getName() {
        return name;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
