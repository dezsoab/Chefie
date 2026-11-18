import { useDroppable } from '@dnd-kit/core'
import type { KitchenOrderDto } from '../api/kitchen'
import type { OrderStatus } from '../api/orders'
import OrderCard from './OrderCard'

type ColumnProps = {
    title: string
    status: OrderStatus
    orders: KitchenOrderDto[]
}

const OrderColumn = ({ title, status, orders }: ColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({ id: status })

    return (
        <section
            ref={setNodeRef}
            className={`min-h-[60vh] rounded-xl bg-gray-100 p-3 transition ${isOver ? 'ring-4 ring-green-400' : ''}`}
        >
            <h2 className="mb-3 text-lg font-bold">{title} ({orders.length})</h2>
            <div className="space-y-2">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </section>
    )
}

export default OrderColumn