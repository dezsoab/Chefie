import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Bell, Clock, Flame, Smartphone, Wifi, type LucideIcon } from 'lucide-react'
import { fetchBoard, fetchWifiCredentials, type BoardEntry } from '../api/board'
import Logo from './Logo'
import Sparkles from './Sparkles'
import ChefNav from './ChefNav'
import { useIsChef } from '../lib/useIsChef'
import { useT } from '../i18n'

const escapeWifi = (value: string) => value.replace(/([\\;,:"])/g, '\\$1')

const MAX_QUEUE = 5
const MAX_READY = 3

const boardSparkles = [
    { top: '6%', left: '42%', size: 16, delay: 0 },
    { top: '14%', left: '58%', size: 10, delay: 1.1 },
    { top: '88%', left: '46%', size: 14, delay: 0.6 },
    { top: '70%', left: '2%', size: 12, delay: 1.8 },
    { top: '4%', left: '96%', size: 12, delay: 2.4 },
    { top: '38%', left: '30%', size: 10, delay: 3.0 },
    { top: '55%', left: '64%', size: 13, delay: 0.9 },
    { top: '92%', left: '78%', size: 9, delay: 2.0 },
]

const QueueRow = ({ entry }: { entry: BoardEntry }) => {
    const cooking = entry.orderStatus === 'COOKING'
    const t = useT()
    return (
        <li
            className={`flex h-[76px] animate-rise items-center gap-5 rounded-3xl px-4 transition-colors duration-500 ${cooking ? 'bg-grape-800 ring-2 ring-sun-400/70' : 'bg-white/[0.06] ring-1 ring-white/10'}`}
        >
            <span
                className={`flex size-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold transition-colors duration-500 ${cooking ? 'bg-sun-400 text-grape-950' : 'bg-grape-700 text-white'}`}
            >
                {entry.number}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-2xl font-extrabold text-white">{entry.guestName}</span>
                <span className="block truncate text-base font-semibold text-grape-300">{entry.itemName}</span>
            </span>
            <span
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-display text-lg font-semibold ${cooking ? 'bg-sun-400 text-grape-950' : 'bg-grape-700/80 text-grape-100'}`}
            >
                {cooking ? <Flame size={20} strokeWidth={2.4} className="animate-pulse" /> : <Clock size={20} strokeWidth={2.4} />}
                {cooking ? t('board.cooking') : t('board.waiting')}
            </span>
        </li>
    )
}

const ReadyCard = ({ entry }: { entry: BoardEntry }) => (
    <li className="animate-ready">
        <div className="flex animate-glow items-center gap-5 rounded-[30px] bg-sun-400 px-6 py-5 text-grape-950">
            <span className="font-display text-7xl font-bold leading-none">#{entry.number}</span>
            <span className="min-w-0">
                <span className="block truncate font-display text-3xl font-semibold">{entry.guestName}</span>
                <span className="block truncate text-lg font-bold text-grape-800">{entry.itemName}</span>
            </span>
        </div>
    </li>
)

const EmptyState = ({ text }: { text: string }) => (
    <div className="flex h-40 items-center justify-center rounded-[28px] border-2 border-dashed border-white/10 px-8 text-center text-xl font-bold text-grape-300">
        {text}
    </div>
)

type QrCardProps = { step: number; title: string; caption: string; icon: LucideIcon; value: string | null }

const QrCard = ({ step, title, caption, icon: Icon, value }: QrCardProps) => (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-[28px] bg-white p-4 text-grape-950 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]">
        <span className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="flex size-8 items-center justify-center rounded-xl bg-grape-700 text-base font-bold text-white">{step}</span>
            {title}
        </span>
        {value ? (
            <QRCodeSVG value={value} size={176} fgColor="#16043a" className="h-[min(176px,21vh)] w-auto" />
        ) : (
            <span className="block size-[min(176px,21vh)] animate-pulse rounded-2xl bg-grape-100" />
        )}
        <span className="flex max-w-full items-center gap-1.5 truncate text-sm font-bold text-grape-700">
            <Icon size={16} strokeWidth={2.4} className="shrink-0" />
            {caption}
        </span>
    </div>
)

const BoardPage = () => {
    const isChef = useIsChef()
    const t = useT()
    const { data: wifi } = useQuery({ queryKey: ['wifi'], queryFn: fetchWifiCredentials })
    const { data, error } = useQuery({ queryFn: fetchBoard, queryKey: ['board'], refetchInterval: 3000 })

    const cooking = data?.filter(o => o.orderStatus === 'COOKING') ?? []
    const waiting = data?.filter(o => o.orderStatus === 'QUEUED') ?? []
    const queue = [...cooking, ...waiting]
    const ready = data?.filter(o => o.orderStatus === 'READY') ?? []
    const menuUrl = `${window.location.origin}/`

    const wifiText = wifi
        ? `WIFI:T:WPA;S:${escapeWifi(wifi.wifiSsid)};P:${escapeWifi(wifi.wifiPassword)};;`
        : null

    return (
        <div className="relative flex h-dvh flex-col gap-6 overflow-hidden bg-stage p-[clamp(1.5rem,3vw,2.5rem)] text-white">
            <Sparkles spots={boardSparkles} />

            <header className="relative flex items-center justify-between">
                <Logo size="lg" />
                <div className="flex items-center gap-3 text-lg font-extrabold">
                    {isChef && <ChefNav />}
                    <span className="rounded-full bg-white/[0.06] px-4 py-2 text-grape-200 ring-1 ring-white/10">
                        {t('board.inQueue', { count: queue.length })}
                    </span>
                    <span className="rounded-full bg-sun-400 px-4 py-2 text-grape-950">{t('board.readyCount', { count: ready.length })}</span>
                </div>
            </header>

            <div className="relative grid min-h-0 flex-1 grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_250px] gap-8">
                <section className="flex min-h-0 flex-col">
                    <h2 className="mb-5 flex items-center gap-3 font-display text-3xl font-semibold text-white">
                        <Clock size={30} strokeWidth={2.3} className="text-grape-300" />
                        {t('board.queueTitle')}
                    </h2>
                    {queue.length === 0 ? (
                        <EmptyState text={t('board.emptyQueue')} />
                    ) : (
                        <ol className="space-y-3 overflow-hidden">
                            {queue.slice(0, MAX_QUEUE).map(entry => <QueueRow key={entry.number} entry={entry} />)}
                            {queue.length > MAX_QUEUE && (
                                <li className="px-4 pt-1 text-lg font-bold text-grape-300">{t('board.moreWaiting', { count: queue.length - MAX_QUEUE })}</li>
                            )}
                        </ol>
                    )}
                </section>

                <section className="flex min-h-0 flex-col">
                    <h2 className="mb-5 flex items-center gap-3 font-display text-4xl font-bold text-puffy">
                        <Bell size={32} strokeWidth={2.4} className="animate-wiggle text-sun-400" />
                        {t('board.readyTitle')}
                    </h2>
                    {ready.length === 0 ? (
                        <EmptyState text={t('board.emptyReady')} />
                    ) : (
                        <ol className="space-y-4 overflow-hidden p-2">
                            {ready.slice(0, MAX_READY).map(entry => <ReadyCard key={entry.number} entry={entry} />)}
                            {ready.length > MAX_READY && (
                                <li className="px-4 text-lg font-bold text-sun-300">{t('board.moreReady', { count: ready.length - MAX_READY })}</li>
                            )}
                        </ol>
                    )}
                </section>

                <aside className="flex min-h-0 flex-col gap-5">
                    <QrCard step={1} title={t('board.wifi')} icon={Wifi} caption={wifi?.wifiSsid ?? t('common.loading')} value={wifiText} />
                    <QrCard step={2} title={t('board.scan')} icon={Smartphone} caption={t('board.opensMenu')} value={menuUrl} />
                </aside>
            </div>

            {error && (
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-200 ring-1 ring-red-400/30">
                    {t('board.connectionLost')}
                </p>
            )}
        </div>
    )
}

export default BoardPage
