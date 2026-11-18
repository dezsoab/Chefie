package io.github.dezsoab.chefie.board;

import io.github.dezsoab.chefie.network.NetworkConnection;
import io.github.dezsoab.chefie.order.OrderService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardService {


    private final OrderService orderService;

    public BoardService(OrderService orderService) {

        this.orderService = orderService;
    }

    public NetworkConnection getWifiConnection(String wifiSsid, String wifiPassword) {
        return new NetworkConnection(wifiSsid, wifiPassword);
    }

    public List<BoardEntry> getBoardEntries() {

        return orderService.getKitchenOrders()
                .stream()
                .map(order -> new BoardEntry(order.number(), order.guestName(), order.itemName(), order.status()))
                .toList();

    }
}
