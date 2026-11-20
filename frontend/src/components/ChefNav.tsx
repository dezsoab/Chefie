import { ChefHat, ClipboardList, LayoutDashboard, Tv, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useChefT } from '../i18n'
import ChefLanguagePicker from './ChefLanguagePicker'
import type { MessageKey } from '../i18n/en'

type NavItem = { to: string; label: MessageKey; icon: LucideIcon; match: (path: string) => boolean }

const items: NavItem[] = [
    { to: '/admin', label: 'nav.admin', icon: LayoutDashboard, match: (path) => path === '/admin' },
    { to: '/admin/setup', label: 'nav.setup', icon: ClipboardList, match: (path) => path.startsWith('/admin/') },
    { to: '/kitchen', label: 'nav.kitchen', icon: ChefHat, match: (path) => path === '/kitchen' },
    { to: '/board', label: 'nav.board', icon: Tv, match: (path) => path === '/board' },
    { to: '/', label: 'nav.menu', icon: UtensilsCrossed, match: (path) => path === '/' },
]

const ChefNav = () => {
    const { pathname } = useLocation()
    const t = useChefT()

    return (
        <div className="flex flex-wrap items-center gap-2">
        <nav aria-label={t('nav.label')} className="flex items-center gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10 backdrop-blur">
            {items.map(({ to, label, icon: Icon, match }) => {
                const active = match(pathname)
                return (
                    <Link
                        key={to}
                        to={to}
                        aria-label={t(label)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition ${active ? 'bg-sun-400 text-grape-950' : 'text-grape-200 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Icon size={16} strokeWidth={2.4} />
                        <span className="hidden md:inline">{t(label)}</span>
                    </Link>
                )
            })}
        </nav>
        <ChefLanguagePicker />
        </div>
    )
}

export default ChefNav
