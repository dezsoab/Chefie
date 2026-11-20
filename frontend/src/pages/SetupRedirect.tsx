import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router'
import { fetchEvents } from '../api/events'

const SetupRedirect = () => {
    const { data, isPending } = useQuery({ queryKey: ['events'], queryFn: fetchEvents })

    if (isPending) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-stage">
                <span className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-sun-400" />
            </div>
        )
    }

    const events = data ?? []
    const target = events.find((event) => event.status === 'OPEN') ?? [...events].sort((a, b) => b.id - a.id)[0]

    return <Navigate to={target ? `/admin/events/${target.id}/setup` : '/admin'} replace />
}

export default SetupRedirect
