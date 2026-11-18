import { useMutation, useQueryClient } from '@tanstack/react-query'
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
        <button className="rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50" onClick={() => mutate()}>Logout</button>
    )
}

export default LogoutButton