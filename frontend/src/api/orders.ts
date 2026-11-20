import { csrfHeaders } from "./csrf";
import { errorMessage } from "./http";

export type PlaceOrderRequest = {
    menuItemId: number,
    guestName: string,
    note: string | null,
    extraIngredientIds: number[];
}

export type OrderCreatedResponse = {
    id: number,
    number: number,
    guestToken: string,
}

export type OrderStatusDto = {
    id: number,
    eventId: number,
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
        throw new Error(await errorMessage(response, "Ordering didn't work. Please try again."))
    }
    return await response.json();
}

export async function fetchOrder(id: string, token: string): Promise<OrderStatusDto | null> {
    const response = await fetch(`/api/orders/${id}`, {
        method: "GET",
        headers: {
            "X-Order-Token": token
        }
    })

    if (response.status === 404 || response.status === 400) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Fetching order failed: " + response.status);
    }

    return await response.json();
}

export async function changeOrderStatus(id: number, status: OrderStatus) {
    const response = await fetch("/api/kitchen/orders/" + id + "/status", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            ...(await csrfHeaders())
        },
        body: JSON.stringify({ status })
    })

    if (!response.ok) {
        throw new Error(await errorMessage(response, "Changing order status failed: " + response.status))
    }
    return await response.json();
}
