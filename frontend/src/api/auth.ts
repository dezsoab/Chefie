import { csrfHeaders, resetCsrf } from "./csrf";

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