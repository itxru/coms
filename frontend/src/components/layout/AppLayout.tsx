import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import Topbar from "./Topbar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile sidebar when navigation changes.
  const [previousPath, setPreviousPath] = useState(location.pathname);

  if (location.pathname !== previousPath) {
    setPreviousPath(location.pathname);
    setIsMenuOpen(false);
  }

  return (
    <div className="coms-app-layout">
      {/* Mobile sidebar backdrop */}
      {isMenuOpen && (
        <button
          type="button"
          className="coms-sidebar-backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close navigation menu"
        />
      )}
      {/* Sidebar navigation */}
      <aside
        id="coms-sidebar-navigation"
        className={`coms-sidebar ${isMenuOpen ? "coms-sidebar-open" : ""}`}
      >
        {/* COMS sidebar will be added here */}
        <Sidebar onNavigate={() => setIsMenuOpen(false)} />
      </aside>

      {/* Main dashboard area */}
      <div className="coms-main-wrapper">
        <header className="coms-topbar">
          {/* Dashboard top navigation will be added here */}
          <Topbar
            onMenuClick={() => setIsMenuOpen((previous) => !previous)}
            isMenuOpen={isMenuOpen}
          />
        </header>

        <main className="coms-main-content">{children}</main>
      </div>
    </div>
  );
}
