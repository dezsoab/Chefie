export type PlaceOrderRequest = {
    menuItemId: number,
    guestName: string,
    note: string | null;
}

export type OrderCreatedResponse = {
    id: number,
    number: number,
    guestToken: string,
}

export type OrderStatusDto = {
    id: number,
    itemName: string,
    status: OrderStatus,
    ordersAhead: number,
    number: number
}

export type OrderStatus = "QUEUED" | "COOKING" | "READY" | "PICKED_UP" | "CANCELLED";

export async function placeOrder(request: PlaceOrderRequest): Promise<OrderCreatedResponse> {
    const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    if (!response.ok) {
        throw new Error("Creating order failed")
    }
    return await response.json();
}

export async function fetchOrder(id: string, token: string): Promise<OrderStatusDto> {
    const response = await fetch(`/api/orders/${id}`, {
        method: "GET",
        headers: {
            "X-Order-Token": token
        }
    })

    if (!response.ok) {
        throw new Error("Fetching order failed: " + response.status);
    }

    return await response.json();
}