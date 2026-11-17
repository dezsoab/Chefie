import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { KitchenOrderDto } from "../api/kitchen";
import { changeOrderStatus, type OrderStatus } from "../api/orders";

const nextStep: Partial<Record<OrderStatus, { label: string; status: OrderStatus }>> = {
    QUEUED: { label: "Start", status: "COOKING" },
    COOKING: { label: "Ready", status: "READY" },
    READY: {
        label: "Picked up", status: "PICKED_UP"
    }
}

type ColumnProps = { title: string; orders: KitchenOrderDto[] }

const OrderColumn = ({ title, orders }: ColumnProps) => {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({ mutationFn: ({ id, status }: { id: number, status: OrderStatus }) => changeOrderStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] }) })

    return <section className="rounded-xl bg-gray-100 p-3">
        <h2 className="mb-3 text-lg font-bold">{title} ({orders.length})</h2>
        <div className="space-y-2">
            {orders.map(order => {
                const step = nextStep[order.status]
                return (
                    <div key={order.id} className="rounded-lg bg-white p-3 shadow">
                        <h3 className="text-3xl font-bold">#{order.number}</h3>
                        <p className="font-medium">{order.itemName}</p>
                        <p className="text-sm text-gray-600">{order.guestName}</p>
                        {order.note && <p className="mt-1 rounded bg-yellow-100 px-2 text-sm">{order.note}</p>}

                        <div className="mt-3 flex gap-2">
                            {step && (
                                <button
                                    onClick={() => mutate({ id: order.id, status: step.status })}
                                    disabled={isPending}
                                    className="flex-1 rounded-lg bg-green-600 py-2 font-semibold text-white disabled:opacity-50"
                                >
                                    {step.label}
                                </button>
                            )}
                            {order.status === 'QUEUED' && (
                                <button
                                    onClick={() => mutate({ id: order.id, status: 'CANCELLED' })}
                                    disabled={isPending}
                                    className="rounded-lg bg-red-100 px-3 py-2 text-red-700 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    </section>
}

export default OrderColumn;