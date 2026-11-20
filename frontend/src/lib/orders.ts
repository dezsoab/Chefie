import type { OrderStatus } from '../api/orders'

export const ORDER_KEY_PREFIX = 'chefie.order.'

export type StoredOrder = { id: string; token: string }

export const isFinalStatus = (status: OrderStatus | undefined) =>
  status === 'PICKED_UP' || status === 'CANCELLED'

export function readStoredOrders(): StoredOrder[] {
  try {
    const orders: StoredOrder[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(ORDER_KEY_PREFIX)) continue
      const token = localStorage.getItem(key)
      if (token) orders.push({ id: key.slice(ORDER_KEY_PREFIX.length), token })
    }
    return orders.sort((a, b) => Number(b.id) - Number(a.id))
  } catch {
    return []
  }
}

export function readOrderToken(id: string | undefined): string | null {
  if (!id) return null
  try {
    return localStorage.getItem(ORDER_KEY_PREFIX + id)
  } catch {
    return null
  }
}

export function forgetOrder(id: string) {
  try {
    localStorage.removeItem(ORDER_KEY_PREFIX + id)
  } catch {
    return
  }
}

export function rememberOrder(id: number, token: string) {
  try {
    localStorage.setItem(ORDER_KEY_PREFIX + id, token)
  } catch {
    return
  }
}

export function minutesSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000))
}

const GUEST_NAME_KEY = 'chefie.guestName'

export function readGuestName(): string {
  try {
    return localStorage.getItem(GUEST_NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function rememberGuestName(name: string) {
  try {
    localStorage.setItem(GUEST_NAME_KEY, name)
  } catch {
    return
  }
}
