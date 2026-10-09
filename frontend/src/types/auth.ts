export type UserRole = "admin" | "staff" | "user_student";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: "bearer";
}

export interface AuthenticatedUser {
    id: number;
    email: string;
    role: UserRole;
}

export type AuthStatus =
| "loading"
| "authenticated"
| "unauthenticated";
