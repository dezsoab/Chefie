package io.github.dezsoab.chefie.order;

public enum OrderStatus {
    QUEUED, COOKING, READY, PICKED_UP, CANCELLED;

    public boolean canMoveTo(OrderStatus next) {
        return switch (this) {
            case QUEUED -> next == COOKING || next == CANCELLED;
            case COOKING -> next == READY || next == CANCELLED;
            case READY -> next == COOKING || next == PICKED_UP;
            case PICKED_UP, CANCELLED -> false;
        };
    }
}
