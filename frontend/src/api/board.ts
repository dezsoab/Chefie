import { loadFailed } from "./http"
import type { OrderStatus } from "./orders"

export type BoardEntry = {
    number: number,
    guestName: string,
    itemName: string,
    orderStatus: OrderStatus
}

export type NetworkConnection = {
    wifiSsid: string,
    wifiPassword: string
}

export async function fetchBoard(): Promise<BoardEntry[]> {
    const response = await fetch("/api/board", {
        method: "GET"
    })

    if (response.status === 404) {
        return [];
    }

    if (!response.ok) {
        throw new Error(loadFailed(response))
    }

    return await response.json();
}

export async function fetchWifiCredentials(): Promise<NetworkConnection> {
    const response = await fetch("/api/board/wifi",
        {
            method: "GET"
        }
    )

    if (!response.ok) {
        throw new Error(loadFailed(response))
    }

    return response.json();
}