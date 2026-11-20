export type ExtraDto = {
    ingredientId: number;
    name: string;
    available: number | null;
    stock: number | null;
    extraAmount: number;
}

export type RecipeNeedDto = {
    ingredientId: number;
    amount: number;
}

export type MenuItemDto = {
    id: number;
    name: string;
    description: string | null;
    ingredients: string[];
    recipe: RecipeNeedDto[];
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
    open: boolean;
    menus: MenuDto[];
    extras: ExtraDto[];
}

export async function fetchMenu(): Promise<MenuResponse | null> {
    const response = await fetch(`/api/menu`);
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error('Failed to fetch menu: ' + response.status);
    }

    return await response.json()
}
