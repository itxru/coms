import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  ShieldCheck,
  ShieldAlert,
  LayoutDashboard,
  Grid2X2,
  ChevronDown,
  ChevronRight,
  FileChartColumn,
  FolderOpen,
  Settings2,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../../contexts/useAuth";
import type { UserRole } from "../../types/auth";

type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  available: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "staff", "user_student"],
    available: true,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FileChartColumn,
    roles: ["admin", "staff"],
    available: false,
  },
  {
    label: "Documents",
    path: "/documents",
    icon: FolderOpen,
    roles: ["admin", "staff"],
    available: false,
  },
  {
    label: "Administration",
    path: "/administration",
    icon: Settings2,
    roles: ["admin"],
    available: false,
  },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const isOperationsRoute =
    location.pathname === "/operations" ||
    location.pathname.startsWith("/operations/");

  const [operationsMenuState, setOperationsMenuState] = useState<{
    pathname: string;
    expanded: boolean;
  } | null>(null);

  const operationsExpanded =
    operationsMenuState?.pathname === location.pathname
      ? operationsMenuState.expanded
      : isOperationsRoute;

  const canAccessIncidents = user?.role === "admin" || user?.role === "staff";

  const visibleItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <nav className="coms-sidebar-nav" aria-label="Main navigation">
      <div className="coms-sidebar-brand">
        <div className="coms-brand-icon">
          <ShieldCheck size={28} strokeWidth={1.8} />
        </div>

        <div className="coms-brand-text">
          <strong>COMS</strong>
          <span>CAMPUS OPERATIONS</span>
        </div>
      </div>

      <div className="coms-sidebar-section">
        <p className="coms-sidebar-heading">MAIN MENU</p>

        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.path}>
              {item.available ? (
                <NavLink
                  to={item.path}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `coms-nav-item ${isActive ? "coms-nav-active" : ""}`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              ) : (
                <div
                  className="coms-nav-item coms-nav-disabled"
                  aria-disabled="true"
                  title="Coming soon"
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  <small>Soon</small>
                </div>
              )}

              {item.path === "/dashboard" && canAccessIncidents && (
                <div className="coms-operations-menu">
                  <button
                    type="button"
                    className={`coms-nav-item coms-operations-toggle ${
                      isOperationsRoute ? "coms-nav-active" : ""
                    }`}
                    aria-expanded={operationsExpanded}
                    aria-controls="coms-operations-submenu"
                    onClick={() =>
                      setOperationsMenuState({
                        pathname: location.pathname,
                        expanded: !operationsExpanded,
                      })
                    }
                  >
                    <Grid2X2 size={19} />
                    <span>Operations</span>

                    {operationsExpanded ? (
                      <ChevronDown size={16} aria-hidden="true" />
                    ) : (
                      <ChevronRight size={16} aria-hidden="true" />
                    )}
                  </button>

                  {operationsExpanded && (
                    <div
                      id="coms-operations-submenu"
                      className="coms-operations-submenu"
                    >
                      <NavLink
                        to="/operations/incidents"
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `coms-nav-item coms-operations-subitem ${
                            isActive ? "coms-nav-active" : ""
                          }`
                        }
                      >
                        <ShieldAlert size={17} />
                        <span>Security Incidents</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="coms-sidebar-footer">
        <p className="coms-sidebar-heading">ACCOUNT</p>

        <div
          className="coms-nav-item coms-nav-disabled"
          aria-disabled="true"
          title="Coming soon"
        >
          <Settings2 size={19} />
          <span>Settings</span>
          <small>Soon</small>
        </div>
      </div>
    </nav>
  );
}
