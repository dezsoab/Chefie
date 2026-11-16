import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { fetchOrder } from '../api/orders'

const OrderStatusPage = () => {
    const { id } = useParams()

    const token = localStorage.getItem(`chefie.order.${id}`)

    const { isPending, error, data } = useQuery({
        queryKey: ['order', id],
        queryFn: () => fetchOrder(id!, token!),
        refetchInterval: 3000,
        enabled: !!token
    })

    if (!token) return <p>This order isn't on this phone.</p>

    return (
        <div>
            {isPending && <p>Loading…</p>}
            {error && error.message}
            {data && <div>
                <h1>{data.itemName}</h1>
                <p className="text-6xl font-bold">#{data.number}</p>
                <p>{data.status} and currently {data.ordersAhead} order(s) ahead.</p>
            </div>}
        </div>
    )
}

export default OrderStatusPage