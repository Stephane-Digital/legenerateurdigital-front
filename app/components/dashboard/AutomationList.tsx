"use client";

export default function AutomationList({ automations, onDelete }) {
  return (
    <div className="grid gap-4">
      {automations.map((auto) => (
        <div
          key={auto.id}
          className="flex items-center justify-between rounded-[8px] border border-[#184b6e] bg-[#0d2a3b]/90 p-4 transition hover:bg-[#123650]"
        >
          <div>
            <h3 className="text-lg font-semibold">{auto.name}</h3>
            <p className="text-sm text-cyan-300">{auto.status}</p>
          </div>
          <button
            onClick={() => onDelete(auto.id)}
            className="text-red-400 transition hover:text-red-600"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
