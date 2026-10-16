import { Bell, LogOut, Menu, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

type TopbarProps = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const roleLabels = {
  admin: "Administrator",
  staff: "Security Staff",
  user_student: "Student",
};

export default function Topbar({ onMenuClick, isMenuOpen }: TopbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="coms-topbar-content">
      <div className="coms-topbar-left">
        <button
          type="button"
          className="coms-menu-button"
          onClick={onMenuClick}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="coms-sidebar-navigation"
        >
          <Menu size={21} />
        </button>

        <span className="coms-topbar-title">
          Campus Operations Management System
        </span>
      </div>

      <div className="coms-topbar-right">
        <span
          className="coms-notification-placeholder"
          title="Notifications coming soon"
          aria-label="Notifications coming soon"
        >
          <Bell size={19} />
        </span>

        <div className="coms-user-profile">
          <span className="coms-user-avatar">
            <UserRound size={17} />
          </span>

          <div className="coms-user-details">
            <strong>{user?.email ?? "COMS User"}</strong>
            <small>{user ? roleLabels[user.role] : "Unknown role"}</small>
          </div>
        </div>

        <button
          type="button"
          className="coms-logout-button"
          onClick={() => void handleLogout()}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
