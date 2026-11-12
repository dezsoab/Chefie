export type EventStatus = "OPEN" | "CLOSED" | "DRAFT";

export type EventDto = {
    id: number;
    name: string;
    status: EventStatus;
    createdAt: string;
}

export async function fetchEvents(): Promise<EventDto[]> {
    const response = await fetch('/api/events');
    if (!response.ok) {
        throw new Error('Failed to fetch events');
    }
    return await (response.json() as Promise<EventDto[]>);
}

export async function createEvent(name: string): Promise<EventDto> {
    const response = await fetch('api/admin/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    })
    if (!response.ok) {
        throw new Error('Failed to create event');
    }
    return await response.json();
}