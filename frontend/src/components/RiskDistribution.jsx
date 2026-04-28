import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  "Low (0-49)": "#10b981",
  "Medium (50-64)": "#f59e0b",
  "High (65-79)": "#f97316",
  "Critical (80-100)": "#ef4444",
};

export default function RiskDistribution({ data }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
        Risk Score Distribution
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#1a1d27",
              border: "1px solid #2a2d3a",
              borderRadius: "8px",
              color: "#e5e7eb",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.range} fill={COLORS[entry.range]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
