"use client";

import { useMemo } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  post: any | null;
  onSave?: (post: any) => void;
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

export default function PostDetailsModal({ open, onClose, post, onSave }: Props) {
  const parsed = useMemo(() => safeParseJSON(post?.contenu ?? post?.content ?? null), [post]);

  const network =
    post?.reseau ??
    post?.network ??
    parsed?.reseau ??
    parsed?.network ??
    parsed?.contenu?.reseau ??
    "—";

  const title =
    post?.titre ??
    post?.title ??
    parsed?.title ??
    parsed?.contenu?.title ??
    "—";

  const scheduledAt =
    post?.date_programmee ??
    post?.scheduled_at ??
    parsed?.date_programmee ??
    parsed?.scheduled_at ??
    "—";

  // contenu affichable (fallback)
  const contentPreview =
    parsed?.draft
      ? JSON.stringify(parsed.draft, null, 2)
      : (typeof post?.contenu === "string"
          ? post.contenu
          : typeof post?.content === "string"
          ? post.content
          : typeof parsed === "object" && parsed
          ? JSON.stringify(parsed, null, 2)
          : "—");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-4xl rounded-3xl border border-yellow-500/20 bg-[#0b0b0f] p-10 shadow-2xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">Édition du post</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="text-white/60">Réseau</div>
              <div className="font-semibold text-white">{String(network)}</div>

              <div className="mt-3 text-white/60">Date</div>
              <div className="font-semibold text-white">{String(scheduledAt)}</div>

              <div className="mt-3 text-white/60">Titre</div>
              <div className="font-semibold text-white">{String(title)}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            ✕ Fermer
          </button>
        </div>

        <div className="mt-8">
          <div className="text-sm font-semibold text-white/80">Contenu (draft)</div>
          <pre className="mt-3 max-h-[380px] overflow-auto rounded-2xl border border-yellow-500/10 bg-black/40 p-4 text-xs text-white/80">
            {contentPreview}
          </pre>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            ← Retour
          </button>

          <button
            onClick={() => onSave?.(post)}
            className="rounded-xl bg-[#ffb800] px-8 py-3 text-sm font-extrabold text-black hover:opacity-95"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
