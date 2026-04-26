import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MerchantBreakdown({ data }) {
  const sorted = [...data].sort((a, b) => b.total_amount - a.total_amount).slice(0, 10);

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
        Spending by Merchant Type
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis type="number" stroke="#6b7280" fontSize={11} />
          <YAxis
            dataKey="merchant_type"
            type="category"
            stroke="#9ca3af"
            fontSize={11}
            width={90}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1d27",
              border: "1px solid #2a2d3a",
              borderRadius: "8px",
              color: "#e5e7eb",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            formatter={(v) => `$${v.toLocaleString()}`}
          />
          <Bar dataKey="total_amount" fill="#4f8ef7" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
