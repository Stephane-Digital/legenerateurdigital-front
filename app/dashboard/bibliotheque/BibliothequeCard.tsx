"use client";

export default function BibliothequeCard({ item }: { item: any }) {
  return (
    <div className="bg-[#0d2a3b]/90 border border-[#184b6e] rounded-[12px] shadow-lg p-6 flex flex-col justify-between hover:scale-[1.03] hover:shadow-lg transition-all duration-300">
      <div>
        <h3 className="text-[#ffb800] font-semibold text-lg mb-2">{item.title}</h3>
        <p className="text-gray-300 text-sm mb-1">
          <span className="text-[#00e0ff] font-medium">Type :</span> {item.type}
        </p>
        <p className="text-gray-400 text-xs">Ajouté le {item.date}</p>
      </div>

      <div className="flex justify-center gap-3 mt-4">
        <button className="btn-luxe-blue text-sm px-4 py-2">Voir</button>
        <button className="btn-luxe text-sm px-4 py-2">Modifier</button>
      </div>
    </div>
  );
}
