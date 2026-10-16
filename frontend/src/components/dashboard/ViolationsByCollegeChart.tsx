import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { ChartPie } from "lucide-react";

export type ViolationCollegeData = {
  college: string;
  violations: number;
};

type ViolationsByCollegeChartProps = {
  data: ViolationCollegeData[];
};

const CHART_COLORS = [
  "#2475DB",
  "#22996D",
  "#E6A100",
  "#DC4C58",
  "#7C65C1",
  "#2A9394",
  "#E87B43",
  "#607D8B",
];

export default function ViolationsByCollegeChart({
  data,
}: ViolationsByCollegeChartProps) {
  const hasData = data.some((item) => item.violations > 0);

  return (
    <section className="coms-chart-card" aria-label="Violations by College">
      <div className="coms-chart-header">
        <div>
          <h2>Violations by College</h2>
          <p>Distribution of recorded student violations</p>
        </div>
      </div>

      {hasData ? (
        <div
          className="coms-chart-container"
          role="img"
          aria-label="Pie chart showing student violations by college"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.filter((item) => item.violations > 0)}
                dataKey="violations"
                nameKey="college"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {data
                  .filter((item) => item.violations > 0)
                  .map((item, index) => (
                    <Cell
                      key={item.college}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
              </Pie>

              <Tooltip formatter={(value) => [value, "Violations"]} />

              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="coms-chart-empty">
          <ChartPie size={32} strokeWidth={1.5} aria-hidden="true" />

          <p>No violation data available</p>

          <span>
            College-level analytics will appear when records are available.
          </span>
        </div>
      )}
    </section>
  );
}
