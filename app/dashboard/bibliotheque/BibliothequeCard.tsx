"use client";

export default function BibliothequeCard({ item }: { item: any }) {
  return (
    <div className="flex flex-col justify-between rounded-[12px] border border-[#184b6e] bg-[#0d2a3b]/90 p-6 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-[#ffb800]">{item.title}</h3>
        <p className="mb-1 text-sm text-gray-300">
          <span className="font-medium text-[#00e0ff]">Type :</span> {item.type}
        </p>
        <p className="text-xs text-gray-400">Ajouté le {item.date}</p>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button className="btn-luxe-blue px-4 py-2 text-sm">Voir</button>
        <button className="btn-luxe px-4 py-2 text-sm">Modifier</button>
      </div>
    </div>
  );
}
