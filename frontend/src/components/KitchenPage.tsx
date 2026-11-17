import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchKitchenOrders } from "../api/kitchen"
import OrderColumn from "./OrderColumn"
import { changeOrderStatus, type OrderStatus } from "../api/orders"

import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'



const KitchenPage = () => {
    const queryClient = useQueryClient();
    const { isPending, error, data } = useQuery({ queryKey: ['kitchen-orders'], queryFn: fetchKitchenOrders, refetchInterval: 3000 })

    const queuedOrders = data?.filter(o => o.status === "QUEUED")
    const cookingOrders = data?.filter(o => o.status === "COOKING")
    const readyOrders = data?.filter(o => o.status === "READY")

    const { mutate, isPending: isChanging, error: changeError } = useMutation({ mutationFn: ({ id, status }: { id: number, status: OrderStatus }) => changeOrderStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] }) })

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    )

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over) return                                   // dropped outside any column
        const order = data?.find(o => o.id === active.id)   // which card was dragged
        const target = over.id as OrderStatus               // which column it landed on
        if (!order || order.status === target) return       // same column, nothing to do
        handleChangeStatus(order.id, target)
    }

    const handleChangeStatus = (id: number, status: OrderStatus) => mutate({ id, status })

    return (
        <>
            {isPending && <p className="p-4">Loading…</p>}
            {error && <p className="p-4 text-red-600">{error.message}</p>}
            {changeError && <p className="p-4 text-red-600">{changeError.message}</p>}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-3 gap-4 p-4">
                    <OrderColumn title="Waiting" status="QUEUED" orders={queuedOrders ?? []} onChangeStatus={handleChangeStatus} busy={isChanging} />
                    <OrderColumn title="Cooking" status="COOKING" orders={cookingOrders ?? []} onChangeStatus={handleChangeStatus} busy={isChanging} />
                    <OrderColumn title="Ready" status="READY" orders={readyOrders ?? []} onChangeStatus={handleChangeStatus} busy={isChanging} />
                </div>
            </DndContext>
        </>
    )
}

export default KitchenPage