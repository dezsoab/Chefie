export type Health = {
    status: string;
    database: string;
    time: string;
}

export async function fetchHealth(): Promise<Health> {
    const response = await fetch('/api/health');
    if (!response.ok) {
        throw new Error('Failed to fetch health data');
    }
    return await response.json() as Promise<Health>;
}