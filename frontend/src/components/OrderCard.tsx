import { useDraggable } from '@dnd-kit/core'
import type { KitchenOrderDto } from '../api/kitchen'

type Props = {
    order: KitchenOrderDto;
}

const OrderCard = ({ order }: Props) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id })

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
            className={`relative rounded-lg bg-white p-3 shadow select-none ${isDragging ? 'z-10 opacity-80 shadow-xl' : ''}`}
        >
            <h3 className="text-3xl font-bold">#{order.number}</h3>
            <p className="font-medium">{order.itemName}</p>
            {order.extras.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                    {order.extras.map((extra) => (
                        <span key={extra} className="rounded-full bg-green-100 px-2 py-0.5 text-sm font-semibold text-green-800">
                            + {extra}
                        </span>
                    ))}
                </div>
            )}
            <p className="text-sm text-gray-600">{order.guestName}</p>
            {order.note && <p className="mt-1 rounded bg-yellow-100 px-2 text-sm">{order.note}</p>}
        </div>
    )
}

export default OrderCard
