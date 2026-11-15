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