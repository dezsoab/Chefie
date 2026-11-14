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
}
