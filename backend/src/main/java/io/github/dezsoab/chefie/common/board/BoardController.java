package io.github.dezsoab.chefie.common.board;

import io.github.dezsoab.chefie.network.NetworkConnection;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/board")
@RestController
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping("/wifi")
    public NetworkConnection getWifiConnection(@Value("${chefie.wifi.ssid}") String wifiSsid,
                                               @Value("${chefie.wifi.password}") String wifiPassword) {
        return boardService.getWifiConnetion(wifiSsid, wifiPassword);
    }
}
