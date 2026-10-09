import { createContext } from "react";

import type {
    AuthenticatedUser,
    AuthStatus,
    LoginRequest,
} from "../types/auth";

export interface AuthContextType {
    user: AuthenticatedUser | null;
    token: string | null;
    status: AuthStatus;
    isAuthenticated: boolean;
    signIn: (credentials: LoginRequest) => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
