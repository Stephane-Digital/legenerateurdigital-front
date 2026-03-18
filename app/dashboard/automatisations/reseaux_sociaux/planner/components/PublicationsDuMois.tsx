"use client";

import SkeletonLoader from "./SkeletonLoader";

// ✅ FIX TS minimal : helper local (../utils/date n’exporte plus formatMonthLabel)
function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export default function PublicationsDuMois({
  currentDate,
  posts = [],
  loading = false,
}: {
  currentDate: Date | null | undefined;
  posts: any[];
  loading?: boolean;
}) {
  // 🔥 Sécurisation anti-crash
  const safeDate = currentDate instanceof Date ? currentDate : new Date();

  const monthLabel = formatMonthLabel(safeDate);

  // Posts filtrés du mois
  const filtered = posts.filter((p) => {
    if (!p.date_programmee) return false;
    const d = new Date(p.date_programmee);
    return (
      d.getMonth() === safeDate.getMonth() &&
      d.getFullYear() === safeDate.getFullYear()
    );
  });

  return (
    <div
      className="
        bg-zinc-900 border border-zinc-800 rounded-2xl p-6
        shadow-lg shadow-black/20 w-full
      "
    >
      {/* ===== HEADER ===== */}
      <h2 className="text-xl font-semibold text-white mb-4">
        Publications du mois —{" "}
        <span className="text-yellow-400 capitalize">{monthLabel}</span>
      </h2>

      {/* ===== SKELETON ===== */}
      {loading && (
        <div className="space-y-4">
          <SkeletonLoader height={28} />
          <SkeletonLoader height={28} />
          <SkeletonLoader height={28} />
        </div>
      )}

      {/* ===== VIDE ===== */}
      {!loading && filtered.length === 0 && (
        <p className="text-zinc-500 italic">
          Aucune publication programmée ce mois-ci.
        </p>
      )}

      {/* ===== LISTE ===== */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.map((post) => {
            const d = new Date(post.date_programmee);

            return (
              <div
                key={post.id}
                className="
                  bg-zinc-800 rounded-xl p-4
                  border border-zinc-700
                  hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20
                  transition-all
                "
              >
                <div className="text-sm text-zinc-400 mb-1">
                  {d.toLocaleDateString("fr-FR")}
                </div>

                <h3 className="text-lg font-medium text-yellow-400">
                  {post.title || "Sans titre"}
                </h3>

                <p className="text-zinc-400 text-sm mt-1">
                  {post.caption || "Aucune description."}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
