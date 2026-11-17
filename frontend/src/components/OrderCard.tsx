import { useDraggable } from '@dnd-kit/core'
import type { KitchenOrderDto } from '../api/kitchen'
import type { OrderStatus } from '../api/orders'

const nextStep: Partial<Record<OrderStatus, { label: string; status: OrderStatus }>> = {
    QUEUED: { label: 'Start', status: 'COOKING' },
    COOKING: { label: 'Ready', status: 'READY' },
    READY: { label: 'Picked up', status: 'PICKED_UP' },
}

type Props = {
    order: KitchenOrderDto
    onChangeStatus: (id: number, status: OrderStatus) => void
    busy: boolean
}

const OrderCard = ({ order, onChangeStatus, busy }: Props) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id })
    const step = nextStep[order.status]

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
            <p className="text-sm text-gray-600">{order.guestName}</p>
            {order.note && <p className="mt-1 rounded bg-yellow-100 px-2 text-sm">{order.note}</p>}

            <div className="mt-3 flex gap-2">
                {step && (
                    <button
                        onClick={() => onChangeStatus(order.id, step.status)}
                        disabled={busy}
                        className="flex-1 rounded-lg bg-green-600 py-2 font-semibold text-white disabled:opacity-50"
                    >
                        {step.label}
                    </button>
                )}
                {order.status === 'QUEUED' && (
                    <button
                        onClick={() => onChangeStatus(order.id, 'CANCELLED')}
                        disabled={busy}
                        className="rounded-lg bg-red-100 px-3 py-2 text-red-700 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    )
}

export default OrderCard