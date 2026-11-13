import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { closeEvent, createEvent, fetchEvents, openEvent, type EventStatus } from '../api/events';
import { fetchHealth } from '../api/health';
import { useState } from 'react';

const statusStyles: Record<EventStatus, string> = {
    OPEN: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    CLOSED: 'bg-red-100 text-red-800',
};

export const AdminPage = () => {
    const { data, isPending, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
    const { data: healthData } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });

    const [name, setName] = useState('');
    const queryClient = useQueryClient();

    const refreshEvents = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    const createMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            refreshEvents();
            setName('');
        },
    });

    const openMutation = useMutation({
        mutationFn: openEvent,
        onSuccess: refreshEvents,
    });

    const closeMutation = useMutation({
        mutationFn: closeEvent,
        onSuccess: refreshEvents,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createMutation.mutate(name);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
            <h1 className="text-3xl font-bold text-green-600">Chefie</h1>

            <div className="text-sm text-gray-600">
                <p>Health: {healthData ? healthData.status : 'Loading...'}</p>
                <p>Database: {healthData ? healthData.database : 'Loading...'}</p>
            </div>

            {isPending && <p>Loading…</p>}
            {error && <p className="text-red-600">{error.message}</p>}
            {data && (
                <ul className="space-y-2">
                    {data.map(event => (
                        <li key={event.id} className="flex items-center gap-3 rounded-lg border p-3">
                            <span className="font-medium">{event.name}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[event.status]}`}>
                                {event.status}
                            </span>
                            <div className="ml-auto flex gap-2">
                                <button
                                    className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                                    onClick={() => openMutation.mutate(event.id)}
                                    disabled={event.status === 'OPEN'}
                                >
                                    Open
                                </button>
                                <button
                                    className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                                    onClick={() => closeMutation.mutate(event.id)}
                                    disabled={event.status === 'CLOSED'}
                                >
                                    Close
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    className="flex-1 rounded border px-3 py-2"
                    placeholder="New event name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button
                    className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                    type="submit"
                    disabled={createMutation.isPending}
                >
                    Create Event
                </button>
            </form>
            {createMutation.isError && <p className="text-red-600">{createMutation.error.message}</p>}
        </div>
    );
};