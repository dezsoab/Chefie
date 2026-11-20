import { useQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react'
import { fetchMe } from '../api/auth';
import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { data, isPending } = useQuery({ queryKey: ['me'], queryFn: fetchMe })

    if (isPending) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-stage">
                <span className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-sun-400" />
            </div>
        )
    }
    if (!data) return <Navigate to="/login" replace />
    return children
}

export default ProtectedRoute
