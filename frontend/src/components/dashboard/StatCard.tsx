import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | null;
  description: string;
  icon: LucideIcon;
  color: "red" | "yellow" | "blue" | "green";
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <article className={`coms-stat-card coms-stat-${color}`}>
      <div className="coms-stat-header">
        <div className="coms-stat-icon">
          <Icon size={21} strokeWidth={2} />
        </div>

        <h3 className="coms-stat-title">{title}</h3>
      </div>

      <div className="coms-stat-body">
        <p className="coms-stat-value">
          {value === null ? "—" : value.toLocaleString()}
        </p>

        <p className="coms-stat-description">
          {value === null ? "No data available" : description}
        </p>
      </div>
    </article>
  );
}
