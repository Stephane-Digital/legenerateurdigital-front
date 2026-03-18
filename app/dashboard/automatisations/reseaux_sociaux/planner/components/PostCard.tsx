"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  post: any;
  onClick?: () => void;
  onDelete?: (id: number | string) => void;
};

function safeParseJSON(x: any) {
  if (!x) return null;
  if (typeof x === "object") return x;
  if (typeof x !== "string") return null;
  try {
    return JSON.parse(x);
  } catch {
    return null;
  }
}

export default function PostCard({ post, onClick, onDelete }: Props) {
  const parsed = useMemo(() => safeParseJSON(post?.contenu ?? null), [post]);

  const titre = post?.titre ?? parsed?.title ?? parsed?.contenu?.title ?? "—";
  const reseau = post?.reseau ?? parsed?.reseau ?? parsed?.network ?? "—";
  const statut = String(post?.statut ?? post?.status ?? parsed?.statut ?? parsed?.status ?? "").toLowerCase();

  const statusTitle =
    statut === "scheduled" || statut === "planifie" || statut === "programmed"
      ? "Programmé"
      : statut === "published"
        ? "Publié"
        : statut === "error"
          ? "Erreur"
          : statut
            ? statut
            : "";

  const dotClass =
    statut === "published"
      ? "bg-emerald-400"
      : statut === "error"
        ? "bg-red-400"
        : statut
          ? "bg-yellow-300"
          : "bg-white/20";

  return (
    <div className="w-full">
      <button
        onClick={onClick}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
        title={titre}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`h-2 w-2 rounded-full ${dotClass}`}
              title={statusTitle}
            />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white/90">{titre}</div>
              <div className="truncate text-[11px] text-white/50">{String(reseau)}</div>
            </div>
          </div>

          {onDelete ? (
            <span className="shrink-0">
              <button
                type="button"
                title="Supprimer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:border-yellow-500/60 hover:bg-white/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(post?.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-white/70" />
              </button>
            </span>
          ) : null}
        </div>
      </button>
    </div>
  );
}
