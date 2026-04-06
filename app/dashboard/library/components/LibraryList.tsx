"use client";

import { useMemo, useState } from "react";

// ✅ FIX TS minimal : ne dépend plus de ../page (pas d’export LibraryItem)
export type LibraryItem = {
  id: number;
  title?: string | null;
  description?: string | null;
  filename?: string | null;
  file_name?: string | null;
  kind?: string | null;
  mime_type?: string | null;
  file_url?: string | null;
  created_at: string; // utilisé par formatDate
};

type Props = {
  items: LibraryItem[] | any;
  selectedId: number | null;
  onSelect: (id: number) => void;
};

type FilterKey = "all" | "post" | "carrousel" | "html" | "other";

function inferFilter(it: LibraryItem): FilterKey {
  const k = (it.kind || "").toLowerCase();
  const mime = (it.mime_type || "").toLowerCase();
  const url = (it.file_url || "").toLowerCase();

  if (k.includes("post")) return "post";
  if (k.includes("carrousel")) return "carrousel";
  if (k === "html" || mime.includes("text/html") || url.endsWith(".html"))
    return "html";
  if (k === "image" || mime.startsWith("image/")) return "other";
  if (k === "text" || k === "json") return "other";
  if (k) return "other";
  return "other";
}

function isPreviewItem(it: any) {
  const title = String(it?.title ?? "").toLowerCase();
  const filename = String(it?.filename ?? it?.file_name ?? "").toLowerCase();
  const desc = String(it?.description ?? "").toLowerCase();
  if (title.includes("lgd_preview__") || filename.includes("lgd_preview__"))
    return true;
  if (desc.includes("preview_for:")) return true;
  return false;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function LibraryList({ items, selectedId, onSelect }: Props) {
  const safeItems: LibraryItem[] = (Array.isArray(items) ? items : []).filter(
    (it) => !isPreviewItem(it)
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const c = { all: safeItems.length, post: 0, carrousel: 0, html: 0, other: 0 };
    for (const it of safeItems) {
      const f = inferFilter(it);
      c[f] += 1;
    }
    return c;
  }, [safeItems]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return safeItems.filter((it) => {
      const f = inferFilter(it);
      if (filter !== "all" && f !== filter) return false;
      if (!s) return true;
      return (
        (it.title || "").toLowerCase().includes(s) ||
        (it.description || "").toLowerCase().includes(s) ||
        (it.filename || "").toLowerCase().includes(s)
      );
    });
  }, [safeItems, search, filter]);

  const Chip = ({ k, label }: { k: FilterKey; label: string }) => {
    const active = filter === k;
    return (
      <button
        type="button"
        onClick={() => setFilter(k)}
        className={[
          "px-3 py-1 rounded-full text-xs border transition",
          active
            ? "bg-[#ffb800] text-black border-[#ffb800]"
            : "border-yellow-500/20 bg-black/30 text-yellow-200 hover:bg-yellow-500/10",
        ].join(" ")}
      >
        {label}{" "}
        <span className={active ? "text-black/70" : "text-white/50"}>
          {counts[k]}
        </span>
      </button>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-yellow-400">Contenus</h2>
        <div className="text-xs text-white/50">{safeItems.length} élément(s)</div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Recherche..."
        className="w-full rounded-xl border border-yellow-500/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-yellow-400/50"
      />

      <div className="flex flex-wrap gap-2 mt-3">
        <Chip k="all" label="Tout" />
        <Chip k="post" label="Post (éditeur)" />
        <Chip k="carrousel" label="Carrousel (éditeur)" />
        <Chip k="html" label="HTML" />
        <Chip k="other" label="Autre" />
      </div>

      <div className="mt-4 grid gap-3 max-h-[520px] overflow-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-sm text-white/50 text-center py-10">
            Aucun contenu trouvé.
          </div>
        ) : (
          filtered.map((it) => {
            const active = it.id === selectedId;
            const kind = inferFilter(it);
            const subtitle =
              kind === "post"
                ? "Post (éditeur) • lgd_post_v5"
                : kind === "carrousel"
                ? "Carrousel (éditeur) • lgd_carrousel_v5"
                : kind === "html"
                ? "HTML"
                : "Autre";

            return (
              <div
                key={it.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(it.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(it.id);
                }}
                className={[
                  "text-left rounded-2xl border p-3 transition relative overflow-hidden cursor-pointer",
                  active
                    ? "border-yellow-400/60 bg-yellow-500/10"
                    : "border-yellow-500/20 bg-black/30 hover:bg-yellow-500/5",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-yellow-200 font-semibold truncate">
                      {it.title || `Item #${it.id}`}
                    </div>
                    <div className="text-xs text-white/60 mt-1 truncate">
                      {subtitle}
                    </div>
                  </div>
                  <div className="text-[11px] text-white/40 whitespace-nowrap">
                    {formatDate(it.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

