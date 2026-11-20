import type { OrderStatus } from "./orders"

export type Portion = {
    name: string,
    amount: number,
    unit: string
}

export type KitchenOrderDto = {
    id: number,
    guestName: string,
    itemName: string,
    recipe: Portion[],
    extras: Portion[],
    note: string | null,
    status: OrderStatus,
    createdAt: string;
    number: number
}

export const fetchKitchenOrders = async (): Promise<KitchenOrderDto[]> => {
    const response = await fetch("/api/kitchen/orders", {
        method: "GET"
    })

    if (response.status === 404) {
        return [];
    }

    if (!response.ok) {
        throw new Error("Fetching kitchen orders failed: " + response.status)
    }

    return await response.json();
}
