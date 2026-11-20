import type { OrderStatus } from "./orders"

export type KitchenOrderDto = {
    id: number,
    guestName: string,
    itemName: string,
    extras: string[],
    note: string | null,
    status: OrderStatus,
    createdAt: string;
    number: number
}

export const fetchKitchenOrders = async (): Promise<KitchenOrderDto[]> => {
    const response = await fetch("/api/kitchen/orders", {
        method: "GET"
    })

    if (!response.ok) {
        throw new Error("Fetching kitchen orders failed: " + response.status)
    }

    return await response.json();
}
