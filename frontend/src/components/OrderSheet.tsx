import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { ExtraDto, MenuItemDto } from '../api/menu'
import { placeOrder } from '../api/orders'
import { readGuestName, rememberGuestName, rememberOrder } from '../lib/orders'
import { unlockAudio } from '../lib/sound'

type Props = {
    item: MenuItemDto | null
    extras: ExtraDto[]
    onClose: () => void
}

const labelClass = 'text-xs font-extrabold uppercase tracking-[0.14em] text-grape-300'
const fieldClass = 'mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-grape-300/60 focus:border-sun-400 focus:ring-4 focus:ring-sun-400/20'

const OrderSheet = ({ item, extras, onClose }: Props) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isOpen = item !== null

    const [shownItem, setShownItem] = useState<MenuItemDto | null>(item)
    if (item !== null && item !== shownItem) {
        setShownItem(item)
    }

    const [guestName, setGuestName] = useState<string>(readGuestName)
    const [note, setNote] = useState('')
    const [extraIds, setExtraIds] = useState<number[]>([])

    const extraFits = (extra: ExtraDto) => {
        if (extra.stock === null) return true
        const inRecipe = shownItem?.recipe.find((need) => need.ingredientId === extra.ingredientId)?.amount ?? 0
        return inRecipe + extra.extraAmount <= extra.stock
    }

    const toggleExtra = (id: number) => {
        setExtraIds((current) =>
            current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
        )
    }

    const { mutate, isPending, error, reset } = useMutation({
        mutationFn: placeOrder,
        onSuccess: (order) => {
            rememberGuestName(guestName.trim())
            rememberOrder(order.id, order.guestToken)
            setNote('')
            setExtraIds([])
            onClose()
            navigate(`/orders/${order.id}`)
        },
        onSettled: () => { queryClient.invalidateQueries({ queryKey: ['menu'] }) },
    })

    const handleClose = () => {
        setExtraIds([])
        reset()
        onClose()
    }

    const handleOrder = () => {
        if (item === null) return
        unlockAudio()
        mutate({
            menuItemId: item.id,
            guestName: guestName.trim(),
            note: note.trim() || null,
            extraIngredientIds: extraIds,
        })
    }

    const orderLabel = isPending
        ? 'Sending to the kitchen…'
        : extraIds.length > 0
            ? `Order with ${extraIds.length} extra${extraIds.length > 1 ? 's' : ''}`
            : 'Order'

    return (
        <>
            <div
                onClick={handleClose}
                className={`fixed inset-0 z-40 bg-grape-950/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={shownItem?.name ?? 'Order'}
                inert={!isOpen}
                className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] max-w-md overflow-y-auto rounded-t-[32px] border-t border-white/10 bg-grape-900 px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[0_-20px_60px_-10px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/20" />

                <h2 className="font-display text-3xl font-bold text-white">{shownItem?.name}</h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                    {shownItem?.ingredients.map((ingredient) => (
                        <li key={ingredient} className="rounded-full bg-grape-500/20 px-2.5 py-1 text-xs font-bold text-grape-100">
                            {ingredient}
                        </li>
                    ))}
                </ul>

                {extras.length > 0 && (
                    <div className="mt-7">
                        <p className={labelClass}>Make it extra</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {extras.map((extra) => {
                                const selected = extraIds.includes(extra.ingredientId)
                                const fits = extraFits(extra)
                                return (
                                    <button
                                        key={extra.ingredientId}
                                        type="button"
                                        onClick={() => toggleExtra(extra.ingredientId)}
                                        disabled={!fits && !selected}
                                        aria-pressed={selected}
                                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold transition duration-200 active:scale-95 disabled:opacity-40 ${selected
                                            ? 'border-sun-400 bg-sun-400 text-grape-950 shadow-[0_8px_22px_-8px_rgb(255_209_46/0.8)]'
                                            : 'border-white/15 bg-white/5 text-grape-100 hover:bg-white/10'
                                            }`}
                                    >
                                        {selected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                                        {extra.name}
                                        {!fits && <span className="text-xs font-extrabold">· sold out</span>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-7 space-y-4">
                    <label className="block">
                        <span className={labelClass}>Your name</span>
                        <input
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="So we know who to call"
                            autoComplete="given-name"
                            maxLength={40}
                            className={fieldClass}
                        />
                    </label>
                    <label className="block">
                        <span className={labelClass}>
                            Note <span className="font-semibold normal-case tracking-normal text-grape-400">(optional)</span>
                        </span>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Anything the chef should know?"
                            rows={2}
                            maxLength={200}
                            className={`${fieldClass} resize-none`}
                        />
                    </label>
                </div>

                {error && (
                    <p className="mt-5 animate-pop rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200 ring-1 ring-red-400/30">
                        {error.message}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleOrder}
                    disabled={!guestName.trim() || isPending}
                    className="btn-sun mt-7 flex w-full items-center justify-center rounded-2xl py-4 font-display text-xl font-semibold disabled:opacity-50"
                >
                    {orderLabel}
                </button>
                <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 w-full py-2 text-sm font-bold text-grape-300 transition hover:text-white"
                >
                    Not now
                </button>
            </div>
        </>
    )
}

export default OrderSheet
