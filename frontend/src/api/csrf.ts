type CsrfToken = { headerName: string; token: string }

let csrf: CsrfToken | null = null

export async function csrfHeaders(): Promise<Record<string, string>> {
    if (csrf != null) return { [csrf.headerName]: csrf.token };

    const response = await fetch("/api/auth/csrf");

    if (!response.ok) {
        throw new Error(`Fetching CSRF token failed: ${response.status}`)
    }

    const csrfHeaders = await response.json();
    csrf = csrfHeaders;

    return { [csrf!.headerName]: csrf!.token };
}

export function resetCsrf() {
    csrf = null;
}