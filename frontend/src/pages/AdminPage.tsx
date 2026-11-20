import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Pause, Play, Square } from 'lucide-react';
import { Link } from 'react-router';
import { closeEvent, createEvent, fetchEvents, holdEvent, openEvent, type EventStatus } from '../api/events';
import { fetchHealth } from '../api/health';
import { useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import Logo from '../components/Logo';
import ChefNav from '../components/ChefNav';

const statusStyles: Record<EventStatus, string> = {
    OPEN: 'bg-sun-400 text-grape-950',
    ON_HOLD: 'bg-sun-400/20 text-sun-200 ring-1 ring-sun-400/40',
    DRAFT: 'bg-white/10 text-grape-100',
    CLOSED: 'bg-red-500/20 text-red-200',
};

const statusLabels: Record<EventStatus, string> = {
    OPEN: 'Open',
    ON_HOLD: 'On hold',
    DRAFT: 'Draft',
    CLOSED: 'Closed',
};

export const AdminPage = () => {
    const { data, isPending, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
    const { data: healthData } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });

    const [name, setName] = useState('');
    const queryClient = useQueryClient();

    const refreshEvents = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['current-event'] });
        queryClient.invalidateQueries({ queryKey: ['menu'] });
    };

    const createMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            refreshEvents();
            setName('');
        },
    });

    const openMutation = useMutation({ mutationFn: openEvent, onSuccess: refreshEvents });
    const holdMutation = useMutation({ mutationFn: holdEvent, onSuccess: refreshEvents });
    const closeMutation = useMutation({ mutationFn: closeEvent, onSuccess: refreshEvents });

    const changeError = openMutation.error ?? holdMutation.error ?? closeMutation.error;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createMutation.mutate(name.trim());
    };

    const healthy = healthData?.status === 'UP' || healthData?.status === 'OK';
    const sortedEvents = [...(data ?? [])].sort((a, b) => b.id - a.id);

    return (
        <div className="min-h-dvh bg-stage">
            <div className="mx-auto max-w-3xl space-y-8 px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <Logo />
                    <div className="flex flex-wrap items-center gap-2">
                        <ChefNav />
                        <LogoutButton />
                    </div>
                </header>

                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h1 className="font-display text-4xl font-bold text-puffy">Events</h1>
                        <span className="flex items-center gap-2 text-xs font-bold text-grape-300">
                            <span className={`size-2 rounded-full ${healthData ? (healthy ? 'bg-emerald-400' : 'bg-sun-400') : 'bg-white/20'}`} />
                            {healthData ? `API ${healthData.status} · DB ${healthData.database}` : 'Checking…'}
                        </span>
                    </div>

                    <div className="grid gap-2 text-xs font-semibold text-grape-200 sm:grid-cols-3">
                        <p className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                            <span className="font-extrabold text-white">Draft</span> · only you see it while you set up the menu.
                        </p>
                        <p className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                            <span className="font-extrabold text-sun-200">On hold</span> · kitchen and TV board are live, guests see "opens soon".
                        </p>
                        <p className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                            <span className="font-extrabold text-sun-300">Open</span> · guests can order.
                        </p>
                    </div>

                    {isPending && <div className="h-20 animate-pulse rounded-[24px] bg-white/[0.06]" />}
                    {error && <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200">{error.message}</p>}
                    {changeError && <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200">{changeError.message}</p>}
                    {data && data.length === 0 && (
                        <p className="rounded-3xl border-2 border-dashed border-white/10 px-4 py-8 text-center text-sm font-bold text-grape-300">
                            No events yet. Create one below, set up its menu, then put it on hold or open it.
                        </p>
                    )}
                    {sortedEvents.length > 0 && (
                        <ul className="space-y-2">
                            {sortedEvents.map(event => (
                                <li key={event.id} className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-display text-lg font-semibold text-white">{event.name}</span>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${statusStyles[event.status]}`}>
                                            {statusLabels[event.status]}
                                        </span>
                                        <Link
                                            to={`/admin/events/${event.id}/setup`}
                                            className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold text-grape-100 ring-1 ring-white/15 transition hover:bg-white/10"
                                        >
                                            <ClipboardList size={16} strokeWidth={2.4} />
                                            Menu setup
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold text-sun-200 ring-1 ring-sun-400/40 transition hover:bg-sun-400/10 disabled:opacity-40"
                                            onClick={() => holdMutation.mutate(event.id)}
                                            disabled={event.status === 'ON_HOLD'}
                                        >
                                            <Pause size={16} strokeWidth={2.6} />
                                            On hold
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-sun flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold disabled:opacity-40"
                                            onClick={() => openMutation.mutate(event.id)}
                                            disabled={event.status === 'OPEN'}
                                        >
                                            <Play size={16} strokeWidth={2.6} />
                                            Open
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold text-red-200 ring-1 ring-red-400/40 transition hover:bg-red-500/15 disabled:opacity-40"
                                            onClick={() => closeMutation.mutate(event.id)}
                                            disabled={event.status === 'CLOSED'}
                                        >
                                            <Square size={14} strokeWidth={2.8} />
                                            Close
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-grape-300/60 focus:border-sun-400 focus:ring-4 focus:ring-sun-400/20"
                        placeholder="New event name"
                        aria-label="New event name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        className="btn-sun shrink-0 rounded-2xl px-5 py-3 font-extrabold disabled:opacity-50"
                        type="submit"
                        disabled={createMutation.isPending || !name.trim()}
                    >
                        Create
                    </button>
                </form>
                {createMutation.isError && <p className="text-sm font-bold text-red-200">{createMutation.error.message}</p>}
            </div>
        </div>
    );
};
