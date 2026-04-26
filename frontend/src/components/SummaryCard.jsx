export default function SummaryCard({ label, value, sublabel, accent = "default" }) {
  const accents = {
    default: "text-gray-100",
    danger: "text-red-400",
    warning: "text-orange-400",
    success: "text-green-400",
    accent: "text-accent",
  };

  const ringAccents = {
    default: "",
    danger: "ring-1 ring-red-500/20",
    warning: "ring-1 ring-orange-500/20",
    success: "ring-1 ring-green-500/20",
    accent: "ring-1 ring-accent/20",
  };

  return (
    <div className={`card ${ringAccents[accent]}`}>
      <div className="text-xs text-muted uppercase tracking-wide font-semibold mb-2">
        {label}
      </div>
      <div className={`text-3xl font-bold ${accents[accent]}`}>{value}</div>
      {sublabel && <div className="text-xs text-muted mt-1">{sublabel}</div>}
    </div>
  );
}
