"use client";

export default function AutomationList({ automations, onDelete }) {
  return (
    <div className="grid gap-4">
      {automations.map((auto) => (
        <div
          key={auto.id}
          className="flex justify-between items-center bg-[#0d2a3b]/90 border border-[#184b6e] rounded-[8px] p-4 hover:bg-[#123650] transition"
        >
          <div>
            <h3 className="font-semibold text-lg">{auto.name}</h3>
            <p className="text-cyan-300 text-sm">{auto.status}</p>
          </div>
          <button
            onClick={() => onDelete(auto.id)}
            className="text-red-400 hover:text-red-600 transition"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
