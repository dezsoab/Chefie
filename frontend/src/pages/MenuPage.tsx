import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { fetchMenu, type MenuItemDto } from '../api/menu'
import OrderSheet from '../components/OrderSheet'
import MyOrdersBar from '../components/MyOrdersBar'
import KitchenClosed from '../components/KitchenClosed'
import Logo from '../components/Logo'
import Sparkles from '../components/Sparkles'
import ChefNav from '../components/ChefNav'
import { useIsChef } from '../lib/useIsChef'
import { useT } from '../i18n'

type CardProps = {
    item: MenuItemDto
    delay: number
    onSelect: () => void
}

const MenuItemCard = ({ item, delay, onSelect }: CardProps) => {
    const t = useT()
    const soldOut = item.available === 0
    const lowStock = item.available !== null && item.available > 0 && item.available <= 3
    const plenty = item.available !== null && item.available > 3

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={soldOut}
            style={{ animationDelay: `${delay}ms` }}
            className="group relative w-full animate-rise overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-4 text-left shadow-[0_14px_34px_-20px_rgb(0_0_0/0.9)] backdrop-blur-sm transition duration-200 hover:border-white/20 hover:bg-white/[0.09] active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100"
        >
            <div className={`flex items-start gap-4 ${soldOut ? 'opacity-40 saturate-50' : ''}`}>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-[22px] font-semibold leading-tight text-white">{item.name}</h3>
                        {lowStock && (
                            <span className="rounded-full bg-sun-400 px-2.5 py-0.5 text-xs font-extrabold text-grape-950">
                                {t('menu.onlyLeft', { count: item.available ?? 0 })}
                            </span>
                        )}
                        {plenty && (
                            <span className="rounded-full bg-sun-400/15 px-2.5 py-0.5 text-xs font-bold text-sun-300">
                                {t('menu.left', { count: item.available ?? 0 })}
                            </span>
                        )}
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                        {item.ingredients.map((ingredient) => (
                            <li key={ingredient} className="rounded-full bg-grape-500/20 px-2.5 py-1 text-xs font-bold text-grape-100">
                                {ingredient}
                            </li>
                        ))}
                    </ul>
                </div>
                <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 ${soldOut ? 'bg-white/10 text-white/40' : 'btn-sun group-hover:rotate-90'}`}
                >
                    <Plus size={24} strokeWidth={2.8} />
                </span>
            </div>
            {soldOut && (
                <span className="absolute right-20 top-1/2 -translate-y-1/2 -rotate-[9deg] rounded-xl border-[3px] border-sun-400 bg-grape-950/80 px-3 py-1 font-display text-lg font-bold tracking-widest text-sun-400">
                    {t('menu.soldOut')}
                </span>
            )}
        </button>
    )
}

const MenuPage = () => {
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: ['menu'],
        queryFn: fetchMenu,
        refetchInterval: 10000,
    })
    const [selectedItem, setSelectedItem] = useState<MenuItemDto | null>(null)
    const isChef = useIsChef()
    const t = useT()

    if (data === null) return <KitchenClosed />

    if (data && !data.open) {
        return (
            <>
                <KitchenClosed />
                <MyOrdersBar eventId={data.eventId} />
            </>
        )
    }

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-stage">
            <Sparkles />
            <div className="relative mx-auto max-w-md px-5 pb-48 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
                {isChef && (
                    <div className="mb-4 flex justify-center">
                        <ChefNav />
                    </div>
                )}
                <header className="flex items-center justify-between gap-3">
                    <Logo />
                    {data && (
                        <span className="truncate rounded-full bg-sun-400 px-3 py-1.5 text-xs font-extrabold text-grape-950">
                            {data.eventName}
                        </span>
                    )}
                </header>

                <div className="mt-9 animate-rise">
                    <h1 className="font-display text-[44px] font-bold leading-[1.05] text-puffy">{t('menu.title')}</h1>
                    <p className="mt-4 text-[15px] leading-relaxed text-grape-200">
                        {t('menu.subtitle')}
                    </p>
                </div>

                {isPending && (
                    <div className="mt-10 space-y-3">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="h-32 animate-pulse rounded-[28px] bg-white/[0.06]" />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="mt-10 rounded-[28px] bg-red-500/10 p-5 ring-1 ring-red-400/30">
                        <p className="font-display text-xl font-semibold text-red-100">{t('menu.loadError')}</p>
                        <p className="mt-1 text-sm text-red-200/80">{error.message}</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
                        >
                            {t('common.tryAgain')}
                        </button>
                    </div>
                )}

                {data?.menus.map((menu, sectionIndex) => (
                    <section key={menu.id} className="mt-10">
                        <h2 className="mb-4 flex items-center gap-3 font-display text-xl font-semibold text-grape-100">
                            {menu.name}
                            <span className="h-px flex-1 bg-linear-to-r from-white/15 to-transparent" />
                        </h2>
                        <ul className="space-y-3">
                            {menu.items.map((item, itemIndex) => (
                                <li key={item.id}>
                                    <MenuItemCard
                                        item={item}
                                        delay={Math.min((sectionIndex * 4 + itemIndex) * 70, 600)}
                                        onSelect={() => setSelectedItem(item)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            {data && <MyOrdersBar eventId={data.eventId} />}
            <OrderSheet item={selectedItem} extras={data?.extras ?? []} onClose={() => setSelectedItem(null)} />
        </div>
    )
}

export default MenuPage
