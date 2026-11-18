package io.github.dezsoab.chefie.board;

import io.github.dezsoab.chefie.network.NetworkConnection;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
        return boardService.getWifiConnection(wifiSsid, wifiPassword);
    }

    @GetMapping
    public List<BoardEntry> getBoardEntries() {
        return boardService.getBoardEntries();
    }
}
