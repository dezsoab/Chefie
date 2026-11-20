import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { Bell, Check, Clock, Flame, Pause, Play, X } from 'lucide-react'
import { Link } from 'react-router'
import { fetchCurrentEvent, holdEvent, openEvent } from '../api/events'
import { fetchKitchenOrders, type KitchenOrderDto } from '../api/kitchen'
import { changeOrderStatus, type OrderStatus } from '../api/orders'
import { playChime, unlockAudio } from '../lib/sound'
import OrderColumn from './OrderColumn'
import DropZone from './DropZone'
import LogoutButton from './LogoutButton'
import Logo from './Logo'
import ChefNav from './ChefNav'

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

    const { data: currentEvent } = useQuery({ queryKey: ['current-event'], queryFn: fetchCurrentEvent, refetchInterval: 10000 })

    const eventMutation = useMutation({
        mutationFn: ({ id, open }: { id: number; open: boolean }) => (open ? openEvent(id) : holdEvent(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-event'] })
            queryClient.invalidateQueries({ queryKey: ['events'] })
        },
    })

    const takingOrders = currentEvent?.status === 'OPEN'

    const highestSeenId = useRef<number | null>(null)

    useEffect(() => {
        if (!data) return
        const highest = data.reduce((max, order) => Math.max(max, order.id), 0)
        if (highestSeenId.current !== null && highest > highestSeenId.current) {
            playChime()
        }
        highestSeenId.current = Math.max(highestSeenId.current ?? 0, highest)
    }, [data])

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

    const showDropBar = draggedOrder?.status === 'READY' || draggedOrder?.status === 'QUEUED'

    return (
        <div onPointerDown={unlockAudio} className="min-h-dvh bg-stage">
            <header className="flex items-center justify-between gap-4 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
                <div className="flex items-center gap-4">
                    <Logo />
                    <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-extrabold text-grape-200 ring-1 ring-white/10">Kitchen</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ChefNav />
                    <LogoutButton />
                </div>
            </header>

            <div className="mx-5 mt-4 flex flex-wrap items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-3">
                {currentEvent ? (
                    <>
                        <span className={`size-2.5 rounded-full ${takingOrders ? 'animate-pulse bg-emerald-400' : 'bg-sun-400'}`} />
                        <span className="font-display text-lg font-semibold text-white">{currentEvent.name}</span>
                        <span className="text-sm font-bold text-grape-200">
                            {takingOrders ? 'Taking orders' : 'On hold · guests see "opens soon"'}
                        </span>
                        <button
                            type="button"
                            onClick={() => eventMutation.mutate({ id: currentEvent.id, open: !takingOrders })}
                            disabled={eventMutation.isPending}
                            className={`ml-auto flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold transition disabled:opacity-50 ${takingOrders ? 'text-sun-200 ring-1 ring-sun-400/40 hover:bg-sun-400/10' : 'btn-sun'}`}
                        >
                            {takingOrders ? <Pause size={16} strokeWidth={2.6} /> : <Play size={16} strokeWidth={2.6} />}
                            {takingOrders ? 'Pause orders' : 'Open kitchen'}
                        </button>
                    </>
                ) : (
                    <>
                        <span className="size-2.5 rounded-full bg-white/30" />
                        <span className="text-sm font-bold text-grape-200">No active event. Put one on hold or open it to start.</span>
                        <Link to="/admin" className="btn-sun ml-auto rounded-xl px-4 py-2 text-sm font-extrabold">
                            Go to Admin
                        </Link>
                    </>
                )}
                {eventMutation.error && <p className="w-full text-sm font-bold text-red-200">{eventMutation.error.message}</p>}
            </div>

            {isPending && <p className="px-5 pt-4 font-bold text-grape-200">Loading orders…</p>}
            {(error || changeError) && (
                <p className="mx-5 mt-4 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200 ring-1 ring-red-400/30">
                    {(error ?? changeError)?.message}
                </p>
            )}

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setDraggedOrder(null)}
            >
                <div className="grid grid-cols-3 gap-4 p-5 pb-40">
                    <OrderColumn title="Waiting" icon={Clock} status="QUEUED" orders={queuedOrders ?? []} />
                    <OrderColumn title="Cooking" icon={Flame} status="COOKING" orders={cookingOrders ?? []} />
                    <OrderColumn title="Ready" icon={Bell} status="READY" orders={readyOrders ?? []} />
                </div>

                {showDropBar && (
                    <div className="fixed inset-x-0 bottom-0 z-20 flex animate-rise gap-4 border-t border-white/10 bg-grape-950/85 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] backdrop-blur-lg">
                        {draggedOrder?.status === 'READY' && (
                            <DropZone status="PICKED_UP" label="Picked up" icon={Check} tone="sun" />
                        )}
                        {draggedOrder?.status === 'QUEUED' && (
                            <DropZone status="CANCELLED" label="Cancel order" icon={X} tone="red" />
                        )}
                    </div>
                )}
            </DndContext>
        </div>
    )
}

export default KitchenPage
