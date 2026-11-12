import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../api/events';
import { fetchHealth } from '../api/health';


export const AdminPage = () => {

    const { data, isPending, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
    const { data: healthData, isPending: isHealthPending, error: healthError } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });


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
        </>
    )
}
