import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MenuItemDto } from '../api/menu'
import { placeOrder } from '../api/orders'
import { useNavigate } from 'react-router'

type Props = {
    item: MenuItemDto | null
    onClose: () => void
}

const OrderSheet = ({ item, onClose }: Props) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const isOpen = item !== null

    const [guestName, setGuestName] = useState<string>(() =>
        localStorage.getItem('chefie.guestName') ?? ''
    )
    const [note, setNote] = useState('')

    const { mutate, isPending, error } = useMutation({
        mutationFn: placeOrder,
        onSuccess: (order) => {
            localStorage.setItem('chefie.guestName', guestName.trim())
            localStorage.setItem(`chefie.order.${order.id}`, order.guestToken)
            setNote('')
            onClose();
            navigate(`/orders/${order.id}`)
        },
        onSettled: () => { queryClient.invalidateQueries({ queryKey: ['menu'] }) }
    })

    const handleOrder = () => {
        if (item === null) return
        mutate({
            menuItemId: item.id,
            guestName: guestName.trim(),
            note: note.trim() || null,
        })
    }

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            />
            <div
                className={`fixed inset-x-0 bottom-0 rounded-t-2xl bg-white p-6 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <h2 className="text-xl font-bold">{item?.name}</h2>
                <p className="text-sm text-gray-600">{item?.ingredients.join(', ')}</p>

                <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    className="mt-4 w-full rounded border px-3 py-2"
                />
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note (optional), e.g. well done"
                    rows={2}
                    className="mt-2 w-full rounded border px-3 py-2"
                />

                <button
                    onClick={handleOrder}
                    disabled={!guestName.trim() || isPending}
                    className="mt-4 w-full rounded-lg bg-green-600 py-3 text-lg font-semibold text-white disabled:opacity-50"
                >
                    {isPending ? 'Ordering…' : 'Order'}
                </button>
                <button onClick={onClose} className="mt-2 w-full py-2 text-gray-500">
                    Cancel
                </button>

                {error && <p className="mt-2 text-red-600">{error.message}</p>}
            </div>
        </>
    )
}

export default OrderSheet