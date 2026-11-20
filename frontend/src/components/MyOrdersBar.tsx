import { useEffect, useMemo, useRef } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Bell, ChevronRight, Clock, Flame, type LucideIcon } from 'lucide-react'
import { fetchOrder, type OrderStatus, type OrderStatusDto } from '../api/orders'
import { forgetOrder, isFinalStatus, readStoredOrders } from '../lib/orders'
import { playChime, vibrate } from '../lib/sound'

type View = { icon: LucideIcon; title: string; detail: string; ready: boolean }

const describe = (order: OrderStatusDto): View => {
  switch (order.status) {
    case 'COOKING':
      return { icon: Flame, title: `#${order.number} is cooking`, detail: order.itemName, ready: false }
    case 'READY':
      return { icon: Bell, title: `#${order.number} is ready!`, detail: "Come grab it while it's hot", ready: true }
    default:
      return {
        icon: Clock,
        title: `Order #${order.number}`,
        detail: order.ordersAhead > 0
          ? `${order.ordersAhead} ahead of you · ${order.itemName}`
          : `You're next · ${order.itemName}`,
        ready: false,
      }
  }
}

const MyOrdersBar = ({ eventId }: { eventId: number }) => {
  const stored = useMemo(() => readStoredOrders(), [])

  const results = useQueries({
    queries: stored.map((order) => ({
      queryKey: ['order', order.id],
      queryFn: () => fetchOrder(order.id, order.token),
      refetchInterval: (query: { state: { data: OrderStatusDto | null | undefined } }) =>
        query.state.data === null || isFinalStatus(query.state.data?.status) ? false : 4000,
      retry: 1,
    })),
  })

  const orders = results.map((result) => result.data)
  const lastStatuses = useRef(new Map<number, OrderStatus>())

  useEffect(() => {
    orders.forEach((order, index) => {
      if (order === null || (order && (order.eventId !== eventId || isFinalStatus(order.status)))) {
        forgetOrder(stored[index].id)
      }
    })

    let becameReady = false
    orders.forEach((order) => {
      if (!order) return
      const previous = lastStatuses.current.get(order.id)
      if (order.status === 'READY' && previous !== undefined && previous !== 'READY') becameReady = true
      lastStatuses.current.set(order.id, order.status)
    })

    if (becameReady) {
      playChime()
      vibrate([180, 90, 180, 90, 320])
    }
  }, [orders, stored, eventId])

  const active = orders
    .filter((order): order is OrderStatusDto => !!order && order.eventId === eventId && !isFinalStatus(order.status))
    .slice(0, 3)

  if (active.length === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="mx-auto flex max-w-md flex-col gap-2">
        {active.map((order) => {
          const view = describe(order)
          const Icon = view.icon
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className={`flex items-center gap-3 rounded-[26px] p-2.5 pr-4 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.75)] backdrop-blur-md transition active:scale-[0.98] ${view.ready ? 'animate-glow bg-sun-400 text-grape-950' : 'animate-rise bg-grape-700/90 text-white ring-1 ring-white/15'}`}
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${view.ready ? 'bg-grape-950 text-sun-400' : order.status === 'COOKING' ? 'bg-sun-400 text-grape-950' : 'bg-white/10 text-grape-100'}`}
              >
                <Icon size={22} strokeWidth={2.3} className={view.ready ? 'animate-wiggle' : ''} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[17px] font-semibold leading-tight">{view.title}</span>
                <span className={`block truncate text-[13px] font-semibold ${view.ready ? 'text-grape-800' : 'text-grape-200'}`}>{view.detail}</span>
              </span>
              <ChevronRight size={20} className={view.ready ? 'text-grape-900' : 'text-grape-200'} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MyOrdersBar
