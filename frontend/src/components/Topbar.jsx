import { useState } from "react";
import { seedTransactions } from "../utils/api";

export default function Topbar({ title, onDataChange }) {
  const [seeding, setSeeding] = useState(false);
  const [seedCount, setSeedCount] = useState(50);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedTransactions({ count: seedCount, fraud_ratio: 0.2 });
      onDataChange?.();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="1"
          max="500"
          value={seedCount}
          onChange={(e) => setSeedCount(Number(e.target.value))}
          className="input w-24"
        />
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="btn-primary disabled:opacity-50"
        >
          {seeding ? "Generating..." : "Generate Data"}
        </button>
      </div>
    </header>
  );
}
