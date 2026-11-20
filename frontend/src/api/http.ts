export async function errorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body = await response.json()
        return typeof body?.message === 'string' && body.message ? body.message : fallback
    } catch {
        return fallback
    }
}
