package io.github.dezsoab.chefie.common.board;

import io.github.dezsoab.chefie.network.NetworkConnection;
import org.springframework.stereotype.Service;

@Service
public class BoardService {

    public NetworkConnection getWifiConnetion(String wifiSsid, String wifiPassword) {
        return new NetworkConnection(wifiSsid, wifiPassword);
    }
}
