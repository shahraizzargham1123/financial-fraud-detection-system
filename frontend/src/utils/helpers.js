export function riskColor(score) {
  if (score >= 80) return "text-red-400";
  if (score >= 65) return "text-orange-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 30) return "text-blue-400";
  return "text-green-400";
}

export function riskBg(score) {
  if (score >= 80) return "bg-red-500/10 border-red-500/30";
  if (score >= 65) return "bg-orange-500/10 border-orange-500/30";
  if (score >= 50) return "bg-yellow-500/10 border-yellow-500/30";
  if (score >= 30) return "bg-blue-500/10 border-blue-500/30";
  return "bg-green-500/10 border-green-500/30";
}

export function severityBadge(severity) {
  const map = {
    critical: "badge-critical",
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low",
  };
  return map[severity] || "badge-low";
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(ts) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
