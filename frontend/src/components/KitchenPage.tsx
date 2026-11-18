import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { fetchKitchenOrders, type KitchenOrderDto } from '../api/kitchen'
import { changeOrderStatus, type OrderStatus } from '../api/orders'
import OrderColumn from './OrderColumn'
import DropZone from './DropZone'
import LogoutButton from './LogoutButton'

const KitchenPage = () => {
    const queryClient = useQueryClient()
    const { isPending, error, data } = useQuery({ queryKey: ['kitchen-orders'], queryFn: fetchKitchenOrders, refetchInterval: 3000 })

    const queuedOrders = data?.filter(o => o.status === 'QUEUED')
    const cookingOrders = data?.filter(o => o.status === 'COOKING')
    const readyOrders = data?.filter(o => o.status === 'READY')

    const { mutate, error: changeError } = useMutation({
        mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => changeOrderStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] }),
    })

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    )

    const [draggedOrder, setDraggedOrder] = useState<KitchenOrderDto | null>(null)

    const handleDragStart = ({ active }: DragStartEvent) => {
        setDraggedOrder(data?.find(o => o.id === active.id) ?? null)
    }

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setDraggedOrder(null)
        if (!over) return
        const order = data?.find(o => o.id === active.id)
        const target = over.id as OrderStatus
        if (!order || order.status === target) return
        mutate({ id: order.id, status: target })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center justify-between px-4 pt-4">
                <h1 className="text-2xl font-bold">Kitchen</h1>
                <LogoutButton />
            </header>

            {isPending && <p className="p-4">Loading…</p>}
            {error && <p className="p-4 text-red-600">{error.message}</p>}
            {changeError && <p className="p-4 text-red-600">{changeError.message}</p>}

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setDraggedOrder(null)}
            >
                <div className="grid grid-cols-3 gap-4 p-4 pb-36">
                    <OrderColumn title="Waiting" status="QUEUED" orders={queuedOrders ?? []} />
                    <OrderColumn title="Cooking" status="COOKING" orders={cookingOrders ?? []} />
                    <OrderColumn title="Ready" status="READY" orders={readyOrders ?? []} />
                </div>

                {draggedOrder && (
                    <div className="fixed inset-x-0 bottom-0 flex gap-4 bg-white/90 p-4 shadow-2xl backdrop-blur">
                        {draggedOrder.status === 'READY' && (
                            <DropZone status="PICKED_UP" label="✓ Picked up" tone="text-green-600" />
                        )}
                        {draggedOrder.status === 'QUEUED' && (
                            <DropZone status="CANCELLED" label="✕ Cancel" tone="text-red-600" />
                        )}
                    </div>
                )}
            </DndContext>
        </div>
    )
}

export default KitchenPage