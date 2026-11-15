package io.github.dezsoab.chefie.order;

import io.github.dezsoab.chefie.event.Event;
import io.github.dezsoab.chefie.menu.MenuItem;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "customer_order")
public class CustomerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @Column(nullable = false)
    private int number;
    @Column(nullable = false)
    private String guestName;

    private String note;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private OrderStatus status;
    @Column(nullable = false)
    private UUID guestToken;
    @Column(nullable = false)
    private Instant createdAt;
    private Instant cookingAt;
    private Instant readyAt;
    private Instant pickedUpAt;

    public CustomerOrder(Event event, MenuItem menuItem, int number, String guestName, String note) {
        this.event = event;
        this.menuItem = menuItem;
        this.number = number;
        this.guestName = guestName;
        this.note = note;
        this.status = OrderStatus.QUEUED;
        this.guestToken = UUID.randomUUID();
        this.createdAt = Instant.now();
    }

    public CustomerOrder() {
        
    }
}

