import { ClipboardCheck } from "lucide-react";

export type PendingAction = {
  id: string;
  title: string;
  description: string;
};

type PendingActionsProps = {
  actions: PendingAction[];
};

export default function PendingActions({ actions }: PendingActionsProps) {
  return (
    <section
      className="coms-records-card"
      aria-labelledby="coms-pending-actions-title"
    >
      <div className="coms-records-header">
        <div>
          <h2 id="coms-pending-actions-title">Pending Actions</h2>
          <p>Security operations requiring attention</p>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="coms-records-empty">
          <ClipboardCheck size={32} strokeWidth={1.5} aria-hidden="true" />

          <p>No pending actions available</p>

          <span>
            Pending security tasks will appear here when the corresponding
            modules are available.
          </span>
        </div>
      ) : (
        <ul className="coms-pending-actions-list">
          {actions.map((action) => (
            <li key={action.id}>
              <strong>{action.title}</strong>
              <p>{action.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
