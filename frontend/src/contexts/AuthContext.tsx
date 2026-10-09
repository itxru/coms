import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type {
  AuthenticatedUser,
  AuthStatus,
  LoginRequest,
} from "../types/auth";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/authService";

import { AuthContext } from "./authContext";

import { getTokenExpiration, isTokenExpired } from "../utils/token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");

  const signIn = useCallback(async (credentials: LoginRequest) => {
    setStatus("loading");

    try {
      const response = await loginRequest(credentials);

      if (isTokenExpired(response.access_token)) {
        throw new Error("Invalid or expired authentication token.");
      }

      // Verify the token and retrieve the user's current role
      // from the backend rather than trusting frontend input.
      const currentUser = await getCurrentUser(response.access_token);

      setToken(response.access_token);
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      setToken(null);
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const currentToken = token;

    // Clear the local session even if the backend request fails.
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");

    if (currentToken) {
      try {
        await logoutRequest(currentToken);
      } catch (error) {
        console.error("Backend logout request failed:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token || status !== "authenticated") {
      return;
    }
    const expiration = getTokenExpiration(token);

    const remainingTime = expiration === null ? 0 : expiration - Date.now();

    const timeoutId = window.setTimeout(
      () => {
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
      },
      Math.max(0, remainingTime),
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [token, status]);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isAuthenticated: status === "authenticated" && user !== null,
      signIn,
      signOut,
    }),
    [user, token, status, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
