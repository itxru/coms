import { GraduationCap } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="coms-dashboard">
      <div className="coms-dashboard-heading">
        <div>
          <h1>My Dashboard</h1>
          <p>
            View your permitted campus security services and personal records.
          </p>
        </div>
      </div>

      <section
        className="coms-chart-card"
        aria-labelledby="student-dashboard-title"
      >
        <div className="coms-chart-header">
          <div>
            <h2 id="student-dashboard-title">My Security Services</h2>
            <p>Your requests and available student services</p>
          </div>
        </div>

        <div className="coms-chart-empty">
          <GraduationCap size={32} strokeWidth={1.5} aria-hidden="true" />

          <p>No personal records available</p>

          <span>
            Your permitted security service records will appear here when this
            feature is connected.
          </span>
        </div>
      </section>
    </div>
  );
}
