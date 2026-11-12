import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEvent, fetchEvents } from '../api/events';
import { fetchHealth } from '../api/health';
import { useState } from 'react';


export const AdminPage = () => {

    const { data, isPending, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
    const { data: healthData } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });

    const [name, setName] = useState('');
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            setName('');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createMutation.mutate(name);
    }

    return (
        <>
            <div>AdminPage</div>

            <h1 className="text-3xl font-bold text-orange-600">Chefie</h1>
            <p>Health Status: {healthData ? healthData.status : 'Loading...'}</p>
            <p>Database: {healthData ? healthData.database : 'Loading...'}</p>
            <p>Time: {healthData ? healthData.time : 'Loading...'}</p>



            {isPending && <p>Loading…</p>}
            {error && <p>{error.message}</p>}
            {data && (
                <ul className="space-y-2">
                    {data.map(event => (
                        <li key={event.id}>{event.name} - {event.status}</li>
                    ))}
                </ul>
            )}


            <form onSubmit={handleSubmit}>
                <input className="rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
                <button className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={createMutation.isPending}>
                    Create Event
                </button>
            </form>
            {createMutation.isError && <p>{createMutation.error.message}</p>}
        </>
    )
}
