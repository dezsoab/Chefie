import { useQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react'
import { fetchMe } from '../api/auth';
import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { data, isPending } = useQuery({ queryKey: ['me'], queryFn: fetchMe })

    if (isPending) return <p className="p-4">Loading…</p>
    if (!data) return <Navigate to="/login" replace />
    return children
}

export default ProtectedRoute