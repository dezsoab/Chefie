import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { logout } from '../api/auth'
import { useNavigate } from 'react-router'

const LogoutButton = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { mutate } = useMutation({
        mutationFn: logout, onSuccess: () => {
            queryClient.setQueryData(['me'], null)
            navigate("/login")
        }
    })
    return (
        <button
            type="button"
            onClick={() => mutate()}
            className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-bold text-grape-200 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
        >
            <LogOut size={16} strokeWidth={2.4} />
            Logout
        </button>
    )
}

export default LogoutButton
