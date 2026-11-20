import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { fetchMe, login } from '../api/auth'
import Logo from './Logo'
import Sparkles from './Sparkles'
import { useT } from '../i18n'
import ChefLanguagePicker from './ChefLanguagePicker'

const fieldClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-grape-300/60 focus:border-sun-400 focus:ring-4 focus:ring-sun-400/20'

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const t = useT()

    const { mutate, isPending, error } = useMutation({
        mutationFn: () => login(username, password),
        onSuccess: async () => {
            await queryClient.query({ queryKey: ['me'], queryFn: fetchMe })
            navigate('/admin')
        },
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        mutate()
    }

    return (
        <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-stage p-5">
            <Sparkles />
            <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-sm animate-pop space-y-4 rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur-md"
            >
                <div className="flex items-center justify-between gap-3">
                    <Logo />
                    <ChefLanguagePicker />
                </div>
                <h1 className="pt-2 font-display text-3xl font-bold text-puffy">{t('login.title')}</h1>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('login.username')}
                    aria-label={t('login.username')}
                    autoComplete="username"
                    className={fieldClass}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.password')}
                    aria-label={t('login.password')}
                    autoComplete="current-password"
                    className={fieldClass}
                />
                <button
                    type="submit"
                    disabled={isPending || !username || !password}
                    className="btn-sun w-full rounded-2xl py-3.5 font-display text-lg font-semibold disabled:opacity-50"
                >
                    {isPending ? t('login.submitting') : t('login.submit')}
                </button>
                {error && (
                    <p className="animate-pop rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200 ring-1 ring-red-400/30">{t('login.error')}</p>
                )}
            </form>
        </div>
    )
}

export default LoginPage
