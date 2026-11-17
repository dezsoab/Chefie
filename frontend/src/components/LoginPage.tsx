import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { login } from '../api/auth'

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const { mutate, isPending, error } = useMutation({
        mutationFn: () => login(username, password),
        onSuccess: () => navigate('/admin'),
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        mutate()
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow">
                <h1 className="text-2xl font-bold">Chefie login</h1>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    autoComplete="username"
                    className="w-full rounded border px-3 py-2"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full rounded border px-3 py-2"
                />
                <button
                    type="submit"
                    disabled={isPending || !username || !password}
                    className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white disabled:opacity-50"
                >
                    {isPending ? 'Logging in…' : 'Login'}
                </button>
                {error && <p className="text-sm text-red-600">{error.message}</p>}
            </form>
        </div>
    )
}

export default LoginPage