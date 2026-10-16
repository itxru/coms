import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | null;
  description: string;
  icon: LucideIcon;
  color: "red" | "yellow" | "blue" | "green";
  isLoading?: boolean;
  hasError?: boolean;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  isLoading = false,
  hasError = false,
}: StatCardProps) {
  const displayValue = isLoading
    ? "..."
    : hasError || value === null
      ? "\u2014"
      : value.toLocaleString();

  const displayDescription = isLoading
    ? "Loading data..."
    : hasError
      ? "Unable to load data"
      : value === null
        ? "No data available"
        : description;

  return (
    <article
      className={`coms-stat-card coms-stat-${color}`}
      aria-busy={isLoading}
    >
      <div className="coms-stat-header">
        <div className="coms-stat-icon">
          <Icon size={21} strokeWidth={2} aria-hidden="true" />
        </div>

        <h3 className="coms-stat-title">{title}</h3>
      </div>

      <div className="coms-stat-body">
        <p className="coms-stat-value">{displayValue}</p>

        <p className="coms-stat-description">{displayDescription}</p>
      </div>
    </article>
  );
}
