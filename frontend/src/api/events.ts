import { csrfHeaders } from "./csrf";
import { errorMessage, loadFailed, saveFailed } from "./http";

export type EventStatus = "DRAFT" | "ON_HOLD" | "OPEN" | "CLOSED";

export type EventDto = {
    id: number;
    name: string;
    status: EventStatus;
    language: string;
    createdAt: string;
}

export async function fetchEvents(): Promise<EventDto[]> {
    const response = await fetch('/api/admin/events');
    if (!response.ok) {
        throw new Error(loadFailed(response));
    }
    return await (response.json() as Promise<EventDto[]>);
}

export async function fetchCurrentEvent(): Promise<EventDto | null> {
    const response = await fetch('/api/events/current');
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(loadFailed(response));
    }
    return await response.json();
}

async function changeEvent(url: string, fallback: string, body?: unknown): Promise<EventDto> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(await csrfHeaders())
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        throw new Error(await errorMessage(response, saveFailed(response) || fallback));
    }
    return await response.json();
}

export const createEvent = ({ name, language }: { name: string; language: string }) =>
    changeEvent('/api/admin/events', 'Failed to create event', { name, language });

export async function deleteEvent(id: number): Promise<void> {
    const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: {
            ...(await csrfHeaders())
        },
    });
    if (!response.ok) {
        throw new Error(await errorMessage(response, saveFailed(response)));
    }
}

export async function changeEventLanguage(id: number, language: string): Promise<EventDto> {
    const response = await fetch(`/api/admin/events/${id}/language`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(await csrfHeaders())
        },
        body: JSON.stringify({ language }),
    });
    if (!response.ok) {
        throw new Error(await errorMessage(response, saveFailed(response)));
    }
    return await response.json();
}

export const openEvent = (id: number) =>
    changeEvent(`/api/admin/events/${id}/open`, 'Failed to open event');

export const holdEvent = (id: number) =>
    changeEvent(`/api/admin/events/${id}/hold`, 'Failed to put event on hold');

export const closeEvent = (id: number) =>
    changeEvent(`/api/admin/events/${id}/close`, 'Failed to close event');
