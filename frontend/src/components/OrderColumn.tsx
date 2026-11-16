import type { KitchenOrderDto } from "../api/kitchen";

type ColumnProps = { title: string; orders: KitchenOrderDto[] }

const OrderColumn = ({ title, orders }: ColumnProps) => (
    <section className="rounded-xl bg-gray-100 p-3">
        <h2 className="mb-3 text-lg font-bold">{title} ({orders.length})</h2>
        <div className="space-y-2">
            {orders.map(order => (
                <div key={order.id} className="rounded-lg bg-white p-3 shadow">
                    <h3 className="text-3xl font-bold">#{order.number}</h3>
                    <p>Order: {order.itemName}</p>
                    <p>Guest: {order.guestName}</p>
                    {order.note && <p className="mt-1 rounded bg-yellow-100 px-2 text-sm">{order.note}</p>}
                </div>
            ))}
        </div>
    </section>
)

export default OrderColumn;