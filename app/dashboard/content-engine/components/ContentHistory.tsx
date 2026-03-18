"use client";

export default function ContentHistory({ history, onSelect }) {
  if (!history.length) return null;

  return (
    <div className="bg-[#0f0f0f] border border-yellow-600/30 p-6 rounded-2xl mt-6">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">Historique</h2>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="cursor-pointer p-3 bg-black border border-yellow-600/20 rounded-lg hover:border-yellow-600/40 transition"
          >
            <p className="text-sm opacity-75 line-clamp-2">
              {item.prompt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
