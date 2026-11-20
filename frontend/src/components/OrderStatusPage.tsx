import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { Bell, Check, ChevronLeft, Clock, Flame, SearchX, X, type LucideIcon } from 'lucide-react'
import { fetchOrder, type OrderStatus } from '../api/orders'
import { forgetOrder, isFinalStatus, readOrderToken } from '../lib/orders'
import { playChime, vibrate } from '../lib/sound'
import Sparkles from './Sparkles'
import { useT } from '../i18n'
import type { MessageKey } from '../i18n/en'

const steps: { status: OrderStatus; label: MessageKey; icon: LucideIcon }[] = [
    { status: 'QUEUED', label: 'status.stepOrdered', icon: Clock },
    { status: 'COOKING', label: 'status.stepCooking', icon: Flame },
    { status: 'READY', label: 'status.stepReady', icon: Bell },
]

const stepIndex: Record<OrderStatus, number> = {
    QUEUED: 0,
    COOKING: 1,
    READY: 2,
    PICKED_UP: 3,
    CANCELLED: -1,
}

const Shell = ({ children }: { children: ReactNode }) => {
    const t = useT()
    return (
    <div className="relative min-h-dvh overflow-hidden bg-stage">
        <Sparkles />
        <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
            <Link
                to="/"
                className="-ml-2 flex w-fit items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-grape-200 transition hover:bg-white/5 hover:text-white"
            >
                <ChevronLeft size={18} strokeWidth={2.6} />
                {t('status.back')}
            </Link>
            {children}
        </div>
    </div>
    )
}

type InfoCardProps = { icon: LucideIcon; title: string; text: string; highlight?: boolean }

const InfoCard = ({ icon: Icon, title, text, highlight = false }: InfoCardProps) => (
    <div
        className={`mt-8 flex animate-rise items-start gap-4 rounded-[28px] p-5 ${highlight ? 'bg-sun-400 text-grape-950' : 'border border-white/10 bg-white/[0.06] text-white'}`}
    >
        <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${highlight ? 'bg-grape-950 text-sun-400' : 'bg-white/10 text-sun-300'}`}
        >
            <Icon size={24} strokeWidth={2.3} />
        </span>
        <span>
            <span className="block font-display text-xl font-semibold leading-tight">{title}</span>
            <span className={`mt-1 block text-sm leading-relaxed ${highlight ? 'font-semibold text-grape-800' : 'text-grape-200'}`}>{text}</span>
        </span>
    </div>
)

const Stepper = ({ current }: { current: number }) => {
    const t = useT()
    return (
    <ol className="mt-10 flex items-start">
        {steps.map((step, index) => {
            const Icon = step.icon
            const done = index < current
            const active = index === current
            return (
                <li key={step.status} className="flex flex-1 items-start last:flex-none">
                    <div className="flex w-20 flex-col items-center gap-2">
                        <span
                            className={`flex size-14 items-center justify-center rounded-2xl transition-all duration-500 ${active
                                ? 'scale-110 bg-sun-400 text-grape-950 shadow-[0_6px_0_var(--color-sun-700),0_18px_40px_-12px_rgb(255_209_46/0.7)]'
                                : done
                                    ? 'bg-grape-500 text-white'
                                    : 'bg-white/[0.06] text-grape-300 ring-1 ring-white/10'
                                }`}
                        >
                            {done ? <Check size={24} strokeWidth={3} /> : <Icon size={24} strokeWidth={2.3} className={active && step.status === 'COOKING' ? 'animate-pulse' : ''} />}
                        </span>
                        <span className={`text-center text-xs font-extrabold ${active ? 'text-sun-300' : done ? 'text-grape-100' : 'text-grape-300'}`}>
                            {t(step.label)}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <span className="mt-7 h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                            <span className={`block h-full rounded-full bg-grape-400 transition-all duration-700 ${index < current ? 'w-full' : 'w-0'}`} />
                        </span>
                    )}
                </li>
            )
        })}
    </ol>
    )
}

const ReadyCard = () => {
    const t = useT()
    return (
    <div className="mt-8 animate-ready">
        <div className="animate-glow rounded-[32px] bg-sun-400 p-7 text-center text-grape-950">
            <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-grape-950 text-sun-400">
                <Bell size={32} strokeWidth={2.3} className="animate-wiggle" />
            </span>
            <p className="mt-4 font-display text-6xl font-bold">{t('status.readyTitle')}</p>
            <p className="mt-2 text-base font-bold text-grape-800">{t('status.readyText')}</p>
        </div>
    </div>
    )
}

const OrderStatusPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const t = useT()
    const token = useMemo(() => readOrderToken(id), [id])

    const { data, isPending, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => fetchOrder(id!, token!),
        enabled: !!token,
        refetchInterval: (query) => {
            const order = query.state.data
            return order === null || isFinalStatus(order?.status) ? false : 3000
        },
    })

    const previousStatus = useRef<OrderStatus | undefined>(undefined)
    const status = data?.status

    useEffect(() => {
        if (status === 'READY' && previousStatus.current !== undefined && previousStatus.current !== 'READY') {
            playChime()
            vibrate([180, 90, 180, 90, 320])
        }
        previousStatus.current = status
    }, [status])

    useEffect(() => {
        if (status !== 'PICKED_UP' || !id) return
        forgetOrder(id)
        const timer = window.setTimeout(() => navigate('/', { replace: true }), 3500)
        return () => window.clearTimeout(timer)
    }, [status, id, navigate])

    if (!token || data === null) {
        return (
            <Shell>
                <InfoCard icon={SearchX} title={t('status.notFoundTitle')} text={t('status.notFoundText')} />
            </Shell>
        )
    }

    if (error) {
        return (
            <Shell>
                <InfoCard icon={X} title={t('status.errorTitle')} text={error.message} />
            </Shell>
        )
    }

    if (isPending || !data) {
        return (
            <Shell>
                <div className="mt-16 h-72 animate-pulse rounded-[32px] bg-white/[0.06]" />
            </Shell>
        )
    }

    const current = stepIndex[data.status]

    return (
        <Shell>
            <div className="mt-6 animate-rise text-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-grape-300">{t('status.yourNumber')}</p>
                <p className="mt-2 animate-pop font-display text-[120px] font-bold leading-none text-puffy">#{data.number}</p>
                <p className="mt-5 font-display text-2xl font-semibold text-white">{data.itemName}</p>
            </div>

            {data.status === 'CANCELLED' && (
                <InfoCard icon={X} title={t('status.cancelledTitle')} text={t('status.cancelledText')} />
            )}

            {data.status === 'PICKED_UP' && (
                <InfoCard icon={Check} title={t('status.pickedUpTitle')} text={t('status.pickedUpText')} highlight />
            )}

            {current >= 0 && current <= 2 && <Stepper current={current} />}

            {data.status === 'QUEUED' && (
                <InfoCard
                    key="queued"
                    icon={Clock}
                    title={data.ordersAhead === 1 ? t('status.aheadOne') : data.ordersAhead > 1 ? t('status.aheadMany', { count: data.ordersAhead }) : t('status.next')}
                    text={t('status.queuedText')}
                />
            )}

            {data.status === 'COOKING' && (
                <InfoCard key="cooking" icon={Flame} title={t('status.cookingTitle')} text={t('status.cookingText')} />
            )}

            {data.status === 'READY' && <ReadyCard />}

            <Link
                to="/"
                className="mt-auto pt-10 text-center text-sm font-bold text-grape-300 transition hover:text-white"
            >
                {t('status.another')}
            </Link>
        </Shell>
    )
}

export default OrderStatusPage
