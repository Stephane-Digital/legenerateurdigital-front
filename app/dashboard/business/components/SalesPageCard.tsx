"use client";

export default function SalesPageCard({ page, onEdit, onDeleted }) {
  const del = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales-pages/delete/${page.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    onDeleted();
  };

  return (
    <div className="bg-[#0f0f0f] border border-yellow-600/30 p-5 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-yellow-400 mb-2">{page.title}</h3>
      <p className="opacity-70 text-sm mb-4 line-clamp-3">{page.subtitle}</p>

      <div className="flex justify-end gap-3">
        <button
          onClick={onEdit}
          className="px-4 py-1.5 bg-yellow-600 text-black rounded-lg"
        >
          Éditer
        </button>

        <button
          onClick={del}
          className="px-4 py-1.5 bg-red-600/80 text-white rounded-lg"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
