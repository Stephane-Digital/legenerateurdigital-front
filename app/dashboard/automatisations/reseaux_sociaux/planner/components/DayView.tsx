"use client";

import { Check, Copy, Download, ExternalLink, Image as ImageIcon, Send, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";

type ManualStatus = "published" | "scheduled";

type Props = {
  open: boolean;
  post: any | null;
  onClose: () => void;
  onMarkStatus: (postId: number | string, status: ManualStatus) => Promise<void>;
};

function safeParseJSON(value: any) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function firstNonEmptyString(...values: any[]) {
  for (const value of values) {
    if (typeof value === "string") {
      const v = value.trim();
      if (v) return v;
    }
  }
  return "";
}

function extractSlides(value: any): any[] {
  if (Array.isArray(value)) return value;
  return [];
}

function extractCaption(post: any, parsed: any) {
  return firstNonEmptyString(
    post?.caption,
    post?.text,
    post?.message,
    parsed?.caption,
    parsed?.text,
    parsed?.texte,
    parsed?.message,
    parsed?.description,
    parsed?.content,
    parsed?.generated_caption,
    typeof post?.contenu === "string" ? post.contenu : "",
    typeof post?.content === "string" ? post.content : ""
  );
}

function extractMediaUrl(post: any, parsed: any) {
  const direct = firstNonEmptyString(
    post?.media_url,
    post?.image_url,
    parsed?.media_url,
    parsed?.image_url,
    parsed?.mediaUrl,
    parsed?.imageUrl,
    parsed?.preview_url,
    parsed?.previewUrl,
    parsed?.thumbnail_url,
    parsed?.thumbnailUrl
  );

  if (direct) return direct;

  const slides = extractSlides(parsed?.slides);
  for (const slide of slides) {
    const candidate = firstNonEmptyString(
      slide?.image_url,
      slide?.media_url,
      slide?.imageUrl,
      slide?.mediaUrl,
      slide?.preview_url,
      slide?.previewUrl,
      slide?.thumbnail_url,
      slide?.thumbnailUrl
    );
    if (candidate) return candidate;
  }

  return "";
}

function extractTitle(post: any, parsed: any) {
  return firstNonEmptyString(
    post?.titre,
    post?.title,
    parsed?.title,
    parsed?.titre,
    parsed?.name,
    parsed?.text_title,
    "Publication LGD"
  );
}

function buildNetworkUrl(network: string) {
  const n = String(network || "").toLowerCase().trim();
  if (n === "instagram") return "https://www.instagram.com/";
  if (n === "facebook") return "https://www.facebook.com/";
  if (n === "pinterest") return "https://www.pinterest.com/";
  if (n === "linkedin") return "https://www.linkedin.com/feed/";
  if (n === "snapchat") return "https://web.snapchat.com/";
  return "";
}

function getStatus(post: any, parsed: any) {
  return String(
    post?.statut ?? post?.status ?? parsed?.statut ?? parsed?.status ?? "scheduled"
  )
    .toLowerCase()
    .trim();
}

export default function AssistedPublishModal({ open, post, onClose, onMarkStatus }: Props) {
  const [copied, setCopied] = useState<"" | "caption" | "media">("");
  const [saving, setSaving] = useState<"" | ManualStatus>("");

  const parsed = useMemo(
    () => safeParseJSON(post?.contenu ?? post?.content ?? null),
    [post]
  );

  const title = useMemo(() => extractTitle(post, parsed), [post, parsed]);
  const caption = useMemo(() => extractCaption(post, parsed), [post, parsed]);
  const mediaUrl = useMemo(() => extractMediaUrl(post, parsed), [post, parsed]);
  const slides = useMemo(() => extractSlides(parsed?.slides), [parsed]);
  const network = useMemo(
    () => String(post?.reseau ?? post?.network ?? parsed?.reseau ?? parsed?.network ?? "").toLowerCase(),
    [post, parsed]
  );
  const networkUrl = useMemo(() => buildNetworkUrl(network), [network]);
  const status = useMemo(() => getStatus(post, parsed), [post, parsed]);
  const isPublished = status.includes("published") || status.includes("envoy") || status.includes("success");

  if (!open || !post) return null;

  const copyValue = async (value: string, type: "caption" | "media") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      alert("Copie impossible sur cet appareil.");
    }
  };

  const handleMark = async (nextStatus: ManualStatus) => {
    if (!post?.id) return;
    setSaving(nextStatus);
    try {
      await onMarkStatus(post.id, nextStatus);
      onClose();
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="mx-auto mt-10 w-full max-w-4xl rounded-[28px] border border-[#2a2a2a] bg-[#0b0b0b] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-500/80">Publication assistée</p>
            <h3 className="mt-2 text-xl md:text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-white/55">
              Ouvre le réseau, colle la légende, ajoute le visuel et garde le suivi directement dans le Planner.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:border-yellow-500/40 hover:text-white"
          >
            Fermer
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Légende prête</p>
                  <p className="mt-2 text-sm text-white/70">
                    Utilise ce texte tel quel ou adapte-le avant de publier.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyValue(caption, "caption")}
                  disabled={!caption}
                  className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 disabled:opacity-40"
                >
                  {copied === "caption" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copier
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/85 whitespace-pre-wrap max-h-[280px] overflow-auto">
                {caption || "Aucune légende détectée. Ouvre l’éditeur pour enrichir le contenu avant publication."}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Visuel / média</p>
                  <p className="mt-2 text-sm text-white/70">
                    Télécharge le média ou ouvre-le directement avant publication.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyValue(mediaUrl, "media")}
                    disabled={!mediaUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 disabled:opacity-40"
                  >
                    {copied === "media" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copier le lien
                  </button>

                  {mediaUrl && (
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300"
                    >
                      <Download className="h-4 w-4" />
                      Ouvrir le média
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/70">
                {mediaUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/85">
                      <ImageIcon className="h-4 w-4 text-yellow-400" />
                      Média détecté pour cette publication.
                    </div>
                    <div className="break-all rounded-xl bg-black/30 px-3 py-2 text-xs text-white/55">{mediaUrl}</div>
                    {slides.length > 1 && (
                      <p className="text-xs text-yellow-300/90">
                        Ce carrousel contient {slides.length} slides. Prépare-les depuis l’éditeur avant publication.
                      </p>
                    )}
                  </div>
                ) : (
                  <p>Aucun média détecté automatiquement. Utilise l’éditeur intelligent ou la bibliothèque pour récupérer le visuel.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/85">Flux recommandé</p>
              <ol className="mt-4 space-y-3 text-sm text-white/80">
                <li>1. Copie la légende LGD.</li>
                <li>2. Ouvre {network || "le réseau"} dans un nouvel onglet.</li>
                <li>3. Ajoute le média préparé puis colle la légende.</li>
                <li>4. Publie manuellement et reviens marquer la publication comme envoyée.</li>
              </ol>

              {networkUrl && (
                <a
                  href={networkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400 px-4 py-3 text-sm font-extrabold text-black hover:opacity-95"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir {network || "le réseau"}
                </a>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Suivi Planner</p>
              <p className="mt-3 text-sm text-white/70">
                Garde ton calendrier propre même sans auto-publication Meta.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => handleMark("published")}
                  disabled={saving !== ""}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400 px-4 py-3 text-sm font-extrabold text-black hover:opacity-95 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {saving === "published" ? "Mise à jour..." : isPublished ? "Confirmer publication" : "Marquer comme publié"}
                </button>

                <button
                  type="button"
                  onClick={() => handleMark("scheduled")}
                  disabled={saving !== ""}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:border-yellow-500/30 disabled:opacity-60"
                >
                  <Undo2 className="h-4 w-4" />
                  {saving === "scheduled" ? "Mise à jour..." : "Remettre en planifié"}
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/55">
                Statut actuel : <span className="text-white/80">{isPublished ? "Publié" : "Planifié"}</span>
                <br />
                Publication assistée = LGD prépare le contenu, l’horaire et le suivi. L’utilisateur garde le contrôle final sur le clic publier.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
