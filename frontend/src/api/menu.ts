export type ExtraDto = {
    ingredientId: number;
    name: string;
    available: number | null;
}

export type MenuItemDto = {
    id: number;
    name: string;
    description: string | null;
    ingredients: string[];
    available: number | null;
}

export type MenuDto = {
    id: number;
    name: string;
    items: MenuItemDto[];
}

export type MenuResponse = {
    eventId: number;
    eventName: string;
    menus: MenuDto[];
    extras: ExtraDto[];
}

export async function fetchMenu(): Promise<MenuResponse> {
    const response = await fetch(`/api/menu`);
    if (!response.ok) {
        throw new Error('Failed to fetch menu: ' + response.status);
    }

    return await response.json()
}