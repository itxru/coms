import type {
    LoginRequest,
    LoginResponse,
    AuthenticatedUser
}
from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid or expired authentication credentials.");
        }

        if (response.status === 403) {
            throw new Error("You do not have permission to access this resource.");
        }
        throw new Error(`Request failed with status ${response.status}.`);
    }
    return response.json() as Promise<T>;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch (`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    return handleResponse<LoginResponse>(response);
}

export async function getCurrentUser(
    token: string
): Promise<AuthenticatedUser> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    return handleResponse<AuthenticatedUser>(response);
}

export async function logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Logout request failed.");
    }
}
