import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Languages, Pause, Play, Square, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { changeEventLanguage, closeEvent, createEvent, deleteEvent, fetchEvents, holdEvent, openEvent, type EventStatus } from '../api/events';
import { fetchHealth } from '../api/health';
import { useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import Logo from '../components/Logo';
import ChefNav from '../components/ChefNav';
import { languageNames, useLanguage, useT, type Language } from '../i18n';

const statusStyles: Record<EventStatus, string> = {
    OPEN: 'bg-sun-400 text-grape-950',
    ON_HOLD: 'bg-sun-400/20 text-sun-200 ring-1 ring-sun-400/40',
    DRAFT: 'bg-white/10 text-grape-100',
    CLOSED: 'bg-red-500/20 text-red-200',
};

const selectClass = 'rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none transition focus:border-sun-400 focus:ring-4 focus:ring-sun-400/20';

const languageOptions = Object.entries(languageNames) as [Language, string][];

export const AdminPage = () => {
    const t = useT();
    const currentLanguage = useLanguage();
    const { data, isPending, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
    const { data: healthData } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });

    const [name, setName] = useState('');
    const [language, setLanguage] = useState<Language>(currentLanguage);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
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
    const languageMutation = useMutation({
        mutationFn: ({ id, language: next }: { id: number; language: string }) => changeEventLanguage(id, next),
        onSuccess: refreshEvents,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            setConfirmDeleteId(null);
            refreshEvents();
        },
    });

    const changeError = openMutation.error ?? holdMutation.error ?? closeMutation.error ?? languageMutation.error ?? deleteMutation.error;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createMutation.mutate({ name: name.trim(), language });
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
                        <h1 className="font-display text-4xl font-bold text-puffy">{t('admin.events')}</h1>
                        <span className="flex items-center gap-2 text-xs font-bold text-grape-300">
                            <span className={`size-2 rounded-full ${healthData ? (healthy ? 'bg-emerald-400' : 'bg-sun-400') : 'bg-white/20'}`} />
                            {healthData ? t('admin.health', { api: healthData.status, db: healthData.database }) : t('admin.checking')}
                        </span>
                    </div>

                    <div className="grid gap-2 text-xs font-semibold text-grape-200 sm:grid-cols-3">
                        <p className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                            <span className="font-extrabold text-white">{t('admin.helpDraftTitle')}</span> · {t('admin.helpDraft')}
                        </p>
                        <p className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                            <span className="font-extrabold text-sun-200">{t('admin.helpHoldTitle')}</span> · {t('admin.helpHold')}
                        </p>
                        <p className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                            <span className="font-extrabold text-sun-300">{t('admin.helpOpenTitle')}</span> · {t('admin.helpOpen')}
                        </p>
                    </div>

                    {isPending && <div className="h-20 animate-pulse rounded-[24px] bg-white/[0.06]" />}
                    {error && <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200">{error.message}</p>}
                    {changeError && <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200">{changeError.message}</p>}
                    {data && data.length === 0 && (
                        <p className="rounded-3xl border-2 border-dashed border-white/10 px-4 py-8 text-center text-sm font-bold text-grape-300">
                            {t('admin.empty')}
                        </p>
                    )}
                    {sortedEvents.length > 0 && (
                        <ul className="space-y-2">
                            {sortedEvents.map(event => (
                                <li key={event.id} className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-display text-lg font-semibold text-white">{event.name}</span>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${statusStyles[event.status]}`}>
                                            {t(`admin.status.${event.status}`)}
                                        </span>
                                        <Link
                                            to={`/admin/events/${event.id}/setup`}
                                            className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold text-grape-100 ring-1 ring-white/15 transition hover:bg-white/10"
                                        >
                                            <ClipboardList size={16} strokeWidth={2.4} />
                                            {t('admin.menuSetup')}
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold text-sun-200 ring-1 ring-sun-400/40 transition hover:bg-sun-400/10 disabled:opacity-40"
                                            onClick={() => holdMutation.mutate(event.id)}
                                            disabled={event.status === 'ON_HOLD'}
                                        >
                                            <Pause size={16} strokeWidth={2.6} />
                                            {t('admin.hold')}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-sun flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold disabled:opacity-40"
                                            onClick={() => openMutation.mutate(event.id)}
                                            disabled={event.status === 'OPEN'}
                                        >
                                            <Play size={16} strokeWidth={2.6} />
                                            {t('admin.open')}
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold text-red-200 ring-1 ring-red-400/40 transition hover:bg-red-500/15 disabled:opacity-40"
                                            onClick={() => closeMutation.mutate(event.id)}
                                            disabled={event.status === 'CLOSED'}
                                        >
                                            <Square size={14} strokeWidth={2.8} />
                                            {t('admin.close')}
                                        </button>
                                        <label className="ml-auto flex items-center gap-2 text-sm font-bold text-grape-200">
                                            <Languages size={16} strokeWidth={2.4} aria-hidden="true" />
                                            <span>{t('admin.guestLanguage')}</span>
                                            <select
                                                value={event.language}
                                                onChange={(e) => languageMutation.mutate({ id: event.id, language: e.target.value })}
                                                className={selectClass}
                                            >
                                                {languageOptions.map(([code, label]) => (
                                                    <option key={code} value={code}>{label}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <button
                                            type="button"
                                            aria-label={t('admin.delete')}
                                            title={event.status === 'OPEN' || event.status === 'ON_HOLD' ? t('admin.deleteNeedsClose') : t('admin.delete')}
                                            onClick={() => setConfirmDeleteId(event.id)}
                                            disabled={event.status === 'OPEN' || event.status === 'ON_HOLD'}
                                            className="flex size-9 items-center justify-center rounded-xl text-grape-200 transition hover:bg-red-500/15 hover:text-red-200 disabled:pointer-events-none disabled:opacity-30"
                                        >
                                            <Trash2 size={16} strokeWidth={2.4} />
                                        </button>
                                    </div>
                                    {confirmDeleteId === event.id && (
                                        <div className="flex animate-pop flex-wrap items-center justify-end gap-2 rounded-2xl bg-red-500/10 p-3 ring-1 ring-red-400/30">
                                            <span className="mr-auto text-sm font-bold text-red-100">{t('admin.deleteConfirm', { name: event.name })}</span>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="rounded-xl px-3 py-1.5 text-sm font-bold text-grape-200 transition hover:bg-white/10"
                                            >
                                                {t('common.keep')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteMutation.mutate(event.id)}
                                                disabled={deleteMutation.isPending}
                                                className="rounded-xl bg-red-500 px-3 py-1.5 text-sm font-extrabold text-white transition hover:bg-red-400 disabled:opacity-50"
                                            >
                                                {t('common.delete')}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
                    <input
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-grape-300/60 focus:border-sun-400 focus:ring-4 focus:ring-sun-400/20"
                        placeholder={t('admin.newEvent')}
                        aria-label={t('admin.newEvent')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <select
                        aria-label={t('admin.guestLanguage')}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className={`${selectClass} py-3`}
                    >
                        {languageOptions.map(([code, label]) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </select>
                    <button
                        className="btn-sun shrink-0 rounded-2xl px-5 py-3 font-extrabold disabled:opacity-50"
                        type="submit"
                        disabled={createMutation.isPending || !name.trim()}
                    >
                        {t('admin.create')}
                    </button>
                </form>
                {createMutation.isError && <p className="text-sm font-bold text-red-200">{createMutation.error.message}</p>}
            </div>
        </div>
    );
};
