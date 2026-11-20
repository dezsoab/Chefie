import { useDroppable } from '@dnd-kit/core'
import type { LucideIcon } from 'lucide-react'
import type { KitchenOrderDto } from '../api/kitchen'
import type { OrderStatus } from '../api/orders'
import OrderCard from './OrderCard'

type ColumnProps = {
    title: string
    icon: LucideIcon
    status: OrderStatus
    orders: KitchenOrderDto[]
}

const OrderColumn = ({ title, icon: Icon, status, orders }: ColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({ id: status })

    return (
        <section
            ref={setNodeRef}
            className={`min-h-[65vh] rounded-[30px] border p-3 transition duration-200 ${isOver ? 'border-sun-400/70 bg-sun-400/[0.07] ring-4 ring-sun-400/30' : 'border-white/10 bg-white/[0.04]'}`}
        >
            <h2 className="mb-3 flex items-center gap-2 px-2 pt-1 font-display text-xl font-semibold text-white">
                <Icon size={22} strokeWidth={2.4} className={status === 'COOKING' ? 'text-sun-400' : 'text-grape-300'} />
                {title}
                <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 font-sans text-sm font-extrabold text-grape-100">{orders.length}</span>
            </h2>
            <div className="space-y-3">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}
                {orders.length === 0 && (
                    <p className="rounded-3xl border-2 border-dashed border-white/10 px-4 py-10 text-center text-sm font-bold text-grape-300">
                        Nothing here
                    </p>
                )}
            </div>
        </section>
    )
}

export default OrderColumn
