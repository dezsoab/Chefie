import { ChefHat, ClipboardList, LayoutDashboard, Tv, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'

type NavItem = { to: string; label: string; icon: LucideIcon; match: (path: string) => boolean }

const items: NavItem[] = [
    { to: '/admin', label: 'Admin', icon: LayoutDashboard, match: (path) => path === '/admin' },
    { to: '/admin/setup', label: 'Setup', icon: ClipboardList, match: (path) => path.startsWith('/admin/') },
    { to: '/kitchen', label: 'Kitchen', icon: ChefHat, match: (path) => path === '/kitchen' },
    { to: '/board', label: 'Board', icon: Tv, match: (path) => path === '/board' },
    { to: '/', label: 'Menu', icon: UtensilsCrossed, match: (path) => path === '/' },
]

const ChefNav = () => {
    const { pathname } = useLocation()

    return (
        <nav aria-label="Chef" className="flex items-center gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10 backdrop-blur">
            {items.map(({ to, label, icon: Icon, match }) => {
                const active = match(pathname)
                return (
                    <Link
                        key={to}
                        to={to}
                        aria-label={label}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition ${active ? 'bg-sun-400 text-grape-950' : 'text-grape-200 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Icon size={16} strokeWidth={2.4} />
                        <span className="hidden md:inline">{label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}

export default ChefNav
