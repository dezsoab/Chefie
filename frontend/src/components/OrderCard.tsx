import { useDraggable } from '@dnd-kit/core'
import { Clock, MessageSquare } from 'lucide-react'
import type { KitchenOrderDto } from '../api/kitchen'
import { minutesSince } from '../lib/orders'

type Props = {
    order: KitchenOrderDto;
}

const OrderCard = ({ order }: Props) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id })
    const minutes = minutesSince(order.createdAt)

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
            className={`relative select-none rounded-3xl border border-white/10 bg-grape-800 p-4 shadow-[0_12px_30px_-16px_rgb(0_0_0/0.85)] ${isDragging ? 'z-10 rotate-2 scale-105 shadow-[0_30px_60px_-15px_rgb(0_0_0/0.9)] ring-2 ring-sun-400' : 'animate-pop'}`}
        >
            <div className="flex items-start justify-between gap-3">
                <span className="font-display text-4xl font-bold leading-none text-sun-300">#{order.number}</span>
                <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-extrabold text-grape-200">
                    <Clock size={13} strokeWidth={2.6} />
                    {minutes === 0 ? 'new' : `${minutes} min`}
                </span>
            </div>
            <p className="mt-3 text-xl font-extrabold leading-tight text-white">{order.itemName}</p>
            {order.recipe.length > 0 && (
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 rounded-2xl bg-grape-950/50 px-3 py-2 text-xs font-semibold text-grape-200">
                    {order.recipe.map((portion) => (
                        <li key={portion.name} className="flex justify-between gap-2">
                            <span className="truncate">{portion.name}</span>
                            <span className="shrink-0 font-extrabold text-white">{portion.amount} {portion.unit}</span>
                        </li>
                    ))}
                </ul>
            )}
            {order.extras.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {order.extras.map((extra) => (
                        <span key={extra.name} className="rounded-full bg-sun-400 px-2.5 py-0.5 text-sm font-extrabold text-grape-950">
                            + {extra.name} · {extra.amount} {extra.unit}
                        </span>
                    ))}
                </div>
            )}
            <p className="mt-2 text-sm font-bold text-grape-200">{order.guestName}</p>
            {order.note && (
                <p className="mt-3 flex gap-2 rounded-2xl bg-sun-400/15 px-3 py-2 text-sm font-bold text-sun-100 ring-1 ring-sun-400/30">
                    <MessageSquare size={16} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                    {order.note}
                </p>
            )}
        </div>
    )
}

export default OrderCard
