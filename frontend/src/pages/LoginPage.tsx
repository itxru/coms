import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    from?: { pathname?: string };
  } | null;
  const requestedPath = locationState?.from?.pathname;
  const redirectTo =
    requestedPath &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//")
      ? requestedPath
      : "/dashboard";
  const { signIn, isAuthenticated, status } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await signIn({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    }
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main>
      <h1>COMS Login</h1>
      <p>Campus Operations Management System</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={isLoading}
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
