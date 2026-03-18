"use client";

import SkeletonLoader from "./SkeletonLoader";

// ✅ FIX TS minimal : ../utils/date n’exporte plus formatFullDate
function formatFullDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PublicationDuJour({
  selectedDate,
  posts = [],
  loading = false,
}: {
  selectedDate: Date | null | undefined;
  posts: any[];
  loading?: boolean;
}) {
  // 🔥 Sécurisation anti-crash : never undefined
  const safeDate = selectedDate instanceof Date ? selectedDate : new Date();

  const todayLabel = formatFullDate(safeDate);

  return (
    <div
      className="
        bg-zinc-900 border border-zinc-800 rounded-2xl p-6
        shadow-lg shadow-black/20 w-full
      "
    >
      {/* ===== HEADER ===== */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">
          Publication du <span className="text-yellow-400">{todayLabel}</span>
        </h2>
      </div>

      {/* ===== SKELETON ===== */}
      {loading && (
        <div className="space-y-4">
          <SkeletonLoader height={32} />
          <SkeletonLoader height={32} />
        </div>
      )}

      {/* ===== VIDE ===== */}
      {!loading && posts.length === 0 && (
        <p className="text-zinc-500 italic">
          Aucune publication prévue aujourd’hui.
        </p>
      )}

      {/* ===== LISTE ===== */}
      {!loading && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="
                bg-zinc-800 rounded-xl p-4
                border border-zinc-700
                hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20
                transition-all
              "
            >
              <h3 className="text-lg font-medium text-yellow-400">
                {post.title || "Sans titre"}
              </h3>
              <p className="text-zinc-400 text-sm">
                {post.caption || "Aucune description."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
