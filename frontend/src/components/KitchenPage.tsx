import { useQuery } from "@tanstack/react-query"
import { fetchKitchenOrders } from "../api/kitchen"
import OrderColumn from "./OrderColumn"

const KitchenPage = () => {

    const { isPending, error, data } = useQuery({ queryKey: ['kitchen-orders'], queryFn: fetchKitchenOrders, refetchInterval: 3000 })

    const queuedOrders = data?.filter(o => o.status === "QUEUED")
    const cookingOrders = data?.filter(o => o.status === "COOKING")
    const readyOrders = data?.filter(o => o.status === "READY")

    return (

        <div className="grid grid-cols-3 gap-4 p-4">
            {isPending && <p className="p-4">Loading…</p>}
            {error && <p className="p-4 text-red-600">{error.message}</p>}
            <OrderColumn title="Waiting" orders={queuedOrders ?? []} />
            <OrderColumn title="Cooking" orders={cookingOrders ?? []} />
            <OrderColumn title="Ready" orders={readyOrders ?? []} />
        </div>
    )
}

export default KitchenPage