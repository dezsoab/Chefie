import { csrfHeaders, resetCsrf } from "./csrf";

type MeResponse = {
    userName: string
}

export async function login(username: string, password: string) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        body: new URLSearchParams({ username, password }),
        headers: { ...(await csrfHeaders()) }
    })

    if (!response.ok) {
        throw new Error("Wrong username or password.")
    }

    resetCsrf()
}

export async function fetchMe(): Promise<MeResponse | null> {
    const response = await fetch("/api/auth/me", {
        method: "GET"
    })

    if (response.status === 401) {
        return null;
    }

    return await response.json();
}

export async function logout() {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
            ...(await csrfHeaders())
        }
    })

    if (!response.ok) {
        throw new Error("Logout failed: " + response.status)
    }

    resetCsrf()
}