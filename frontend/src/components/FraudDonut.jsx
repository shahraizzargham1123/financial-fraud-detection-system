import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function FraudDonut({ fraud, normal }) {
  const data = [
    { name: "Normal", value: normal },
    { name: "Fraud", value: fraud },
  ];
  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
        Fraud vs Normal
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1a1d27",
              border: "1px solid #2a2d3a",
              borderRadius: "8px",
              color: "#e5e7eb",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
