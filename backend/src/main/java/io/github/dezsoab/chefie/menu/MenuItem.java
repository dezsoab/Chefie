package io.github.dezsoab.chefie.menu;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_item")
public class MenuItem {
    private final boolean enabled = true;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_id")
    private Menu menu;
    @Column(nullable = false)
    private String name;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String description;
    private int sortOrder;

    public MenuItem() {
    }

    public MenuItem(Menu menu, String name) {
        this.menu = menu;
        this.name = name;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Menu getMenu() {
        return menu;
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
