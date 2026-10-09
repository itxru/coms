import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useAuth } from "../contexts/useAuth";

import type { UserRole } from "../types/auth";

vi.mock("../contexts/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function mockAuthentication(
  role: UserRole | null,
  status: "loading" | "authenticated" | "unauthenticated",
) {
  const user = role
    ? {
        id: 1,
        email: "test@example.com",
        role,
      }
    : null;

  mockedUseAuth.mockReturnValue({
    user,
    token: role ? "mock-token" : null,
    status,
    isAuthenticated: status === "authenticated" && user !== null,
    signIn: vi.fn(),
    signOut: vi.fn(),
  });
}

function renderProtectedRoute(
  allowedRoles?: UserRole[],
  initialPath = "/protected",
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<h1>Login Page</h1>} />
        <Route path="/403" element={<h1>Access Denied</h1>} />

        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/protected" element={<h1>Protected Content</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("COMS ProtectedRoute", () => {
  it("redirects unauthenticated users to Login", () => {
    mockAuthentication(null, "unauthenticated");
    renderProtectedRoute();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("allows authenticated users to access a general protected page", () => {
    mockAuthentication("staff", "authenticated");
    renderProtectedRoute();

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("allows Admin to access an Admin-only page", () => {
    mockAuthentication("admin", "authenticated");
    renderProtectedRoute(["admin"]);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("denies Staff access to an Admin-only page", () => {
    mockAuthentication("staff", "authenticated");
    renderProtectedRoute(["admin"]);

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("denies Student access to an Admin-only page", () => {
    mockAuthentication("user_student", "authenticated");
    renderProtectedRoute(["admin"]);

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("allows Staff to access a Staff-only page", () => {
    mockAuthentication("staff", "authenticated");
    renderProtectedRoute(["staff"]);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("denies Admin access to a Staff-only page", () => {
    mockAuthentication("admin", "authenticated");
    renderProtectedRoute(["staff"]);

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("allows Student to access a Student-only page", () => {
    mockAuthentication("user_student", "authenticated");
    renderProtectedRoute(["user_student"]);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("denies Staff access to a Student-only page", () => {
    mockAuthentication("staff", "authenticated");
    renderProtectedRoute(["user_student"]);

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("shows a loading message while authentication is processing", () => {
    mockAuthentication(null, "loading");
    renderProtectedRoute();

    expect(screen.getByText("Verifying your session...")).toBeInTheDocument();

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
