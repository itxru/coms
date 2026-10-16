import { NavLink } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  Grid2X2,
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
    label: "Operations",
    path: "/operations",
    icon: Grid2X2,
    roles: ["admin", "staff", "user_student"],
    available: false,
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

export default function Sidebar() {
  const { user } = useAuth();

  const visibleItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <nav className="coms-sidebar-nav" aria-label="Main navigation">
      {/* COMS branding */}
      <div className="coms-sidebar-brand">
        <div className="coms-brand-icon">
          <ShieldCheck size={28} strokeWidth={1.8} />
        </div>

        <div className="coms-brand-text">
          <strong>COMS</strong>
          <span>CAMPUS OPERATIONS</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="coms-sidebar-section">
        <p className="coms-sidebar-heading">MAIN MENU</p>

        {visibleItems.map((item) => {
          const Icon = item.icon;

          if (!item.available) {
            return (
              <div
                key={item.path}
                className="coms-nav-item coms-nav-disabled"
                aria-disabled="true"
                title="Coming soon"
              >
                <Icon size={19} />
                <span>{item.label}</span>
                <small>Soon</small>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `coms-nav-item ${isActive ? "coms-nav-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Account controls will be added later */}
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
