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

    if (!response.ok) {
        throw new Error("Fetching board failed: " + response.status)
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
        throw new Error("Getting wifi credentials failed: " + response.status)
    }

    return response.json();
}