import { csrfHeaders } from './csrf'
import { errorMessage } from './http'

export type IngredientAdminDto = {
    id: number
    name: string
    unit: string
    stock: number | null
    extraAmount: number | null
    version: number
}

export type RecipeLineDto = {
    ingredientId: number
    ingredientName: string
    unit: string
    amount: number
}

export type MenuItemAdminDto = {
    id: number
    name: string
    enabled: boolean
    lines: RecipeLineDto[]
}

export type MenuAdminDto = {
    id: number
    name: string
    items: MenuItemAdminDto[]
}

export type SetupDto = {
    eventId: number
    eventName: string
    ingredients: IngredientAdminDto[]
    menus: MenuAdminDto[]
}

export type IngredientRequest = {
    name: string
    unit: string
    stock: number | null
    extraAmount: number | null
    version?: number
}

export type RecipeLineRequest = {
    ingredientId: number
    amount: number
}

export type MenuItemRequest = {
    name: string
    enabled: boolean
    lines: RecipeLineRequest[]
}

async function send(url: string, method: string, body?: unknown): Promise<void> {
    const response = await fetch(url, {
        method,
        headers: {
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(await csrfHeaders()),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) {
        throw new Error(await errorMessage(response, `Saving failed (${response.status})`))
    }
}

export async function fetchSetup(eventId: number): Promise<SetupDto> {
    const response = await fetch(`/api/admin/events/${eventId}/setup`)
    if (!response.ok) {
        throw new Error(await errorMessage(response, `Loading the setup failed (${response.status})`))
    }
    return await response.json()
}

export const createIngredient = (eventId: number, request: IngredientRequest) =>
    send(`/api/admin/events/${eventId}/ingredients`, 'POST', request)

export const updateIngredient = (id: number, request: IngredientRequest) =>
    send(`/api/admin/ingredients/${id}`, 'PUT', request)

export const adjustStock = (id: number, delta: number) =>
    send(`/api/admin/ingredients/${id}/stock`, 'POST', { delta })

export const deleteIngredient = (id: number) =>
    send(`/api/admin/ingredients/${id}`, 'DELETE')

export const createMenu = (eventId: number, name: string) =>
    send(`/api/admin/events/${eventId}/menus`, 'POST', { name })

export const deleteMenu = (id: number) =>
    send(`/api/admin/menus/${id}`, 'DELETE')

export const createMenuItem = (menuId: number, request: MenuItemRequest) =>
    send(`/api/admin/menus/${menuId}/items`, 'POST', request)

export const updateMenuItem = (id: number, request: MenuItemRequest) =>
    send(`/api/admin/menu-items/${id}`, 'PUT', request)

export const deleteMenuItem = (id: number) =>
    send(`/api/admin/menu-items/${id}`, 'DELETE')
