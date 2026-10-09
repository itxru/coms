import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { login, getCurrentUser } from "../services/authService.ts";

import { AuthProvider } from "../contexts/AuthContext.tsx";
import { useAuth } from "../contexts/useAuth";

// Mock backend authentication requests.
// Tests will not contact FastAPI or PostgreSQL.
vi.mock("../services/authService", () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

function AuthStatusDisplay() {
  const { user, status, isAuthenticated, signIn } = useAuth();

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void signIn({
            email: "staff@example.com",
            password: "TestPassword123!",
          });
        }}
      >
        {" "}
        Test Login
      </button>
      <p data-testid="auth-status">{status}</p>
      <p data-testid="is-authenticated">{String(isAuthenticated)}</p>
      <p data-testid="user-email">{user?.email ?? "No user"}</p>
    </div>
  );
}

describe("COMS AuthProvider", () => {
  it("starts with an unauthenticated session", () => {
    render(
      <AuthProvider>
        <AuthStatusDisplay />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "unauthenticated",
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");

    expect(screen.getByTestId("user-email")).toHaveTextContent("No user");
  });

  it("authenticates a user after succesful login", async () => {
    const user = userEvent.setup();

    const expiration = Math.floor(Date.now() / 1000) + 3600;

    // Create a mock JWT containing a future expiration.
    // This token is not signed and is used only for testing.
    const payload = btoa(JSON.stringify({ exp: expiration }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const mockToken = `header.${payload}.signature`;

    vi.mocked(login).mockResolvedValue({
      access_token: mockToken,
      token_type: "bearer",
    });

    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 2,
      email: "staff@example.com",
      role: "staff",
    });

    render(
      <AuthProvider>
        <AuthStatusDisplay />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Test Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "authenticated",
      );
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");

    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "staff@example.com",
    );

    expect(login).toHaveBeenCalledWith({
      email: "staff@example.com",
      password: "TestPassword123!",
    });

    expect(getCurrentUser).toHaveBeenCalledWith(mockToken);
  });
});
