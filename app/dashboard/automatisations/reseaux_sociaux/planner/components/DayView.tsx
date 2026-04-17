"use client";

import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, Trash2 } from "lucide-react";
import AssistedPublishModal from "./AssistedPublishModal";
import { formatDateKey } from "../utils/date";

const API_PROXY_PREFIX = "/api/proxy";

async function proxyJson(path: string, init?: RequestInit) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_PROXY_PREFIX}${normalized}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) throw new Error(`${normalized} failed (${res.status})`);
  return await res.json().catch(() => ({}));
}

const icons: Record<string, JSX.Element> = {
  instagram: <div className="w-2 h-2 rounded bg-pink-400" />,
  facebook: <div className="w-2 h-2 rounded bg-blue-500" />,
  linkedin: <div className="w-2 h-2 rounded bg-blue-400" />,
  tiktok: <div className="w-2 h-2 rounded bg-white" />,
  youtube: <div className="w-2 h-2 rounded bg-red-500" />,
  snapchat: <div className="w-2 h-2 rounded bg-yellow-300" />,
};

interface Props {
  currentDate: Date;
}

async function fetchPlannerPosts() {
  try {
    const data = await proxyJson("/planner/posts");
    if (Array.isArray(data)) return data;
  } catch {
    // ignore
  }
  try {
    const data2 = await proxyJson("/social-posts");
    return Array.isArray(data2) ? data2 : [];
  } catch {
    return [];
  }
}

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

function guessKind(post: any, parsed: any) {
  const k =
    post?.kind ??
    post?.type ??
    post?.format ??
    parsed?.kind ??
    parsed?.type ??
    parsed?.format ??
    "";

  const s = String(k).toLowerCase();
  if (s.includes("carrousel") || s.includes("carousel")) return "carrousel";
  return "post";
}

function isSent(post: any, parsed: any) {
  const s =
    post?.statut ??
    post?.status ??
    parsed?.statut ??
    parsed?.status ??
    parsed?.meta?.statut ??
    parsed?.meta?.status ??
    "";

  const v = String(s).toLowerCase();
  return (
    v.includes("sent") ||
    v.includes("envoy") ||
    v.includes("success") ||
    v.includes("published") ||
    v.includes("publié")
  );
}

function getPostTitleAndPreview(post: any) {
  const parsed = safeParseJSON(post?.contenu ?? post?.content ?? null);

  const titre =
    post?.titre ??
    post?.title ??
    parsed?.title ??
    parsed?.titre ??
    parsed?.contenu?.title ??
    parsed?.contenu?.titre ??
    (guessKind(post, parsed) === "carrousel" ? "Carrousel" : "Post");

  const previewCandidate =
    (typeof parsed === "object" && parsed
      ? parsed?.content ?? parsed?.texte ?? parsed?.text ?? parsed?.description ?? null
      : null) ??
    (typeof post?.contenu === "string" ? post.contenu : null) ??
    (typeof post?.content === "string" ? post.content : null) ??
    "—";

  const preview =
    typeof previewCandidate === "string"
      ? previewCandidate
      : (() => {
          try {
            return JSON.stringify(previewCandidate);
          } catch {
            return "—";
          }
        })();

  return { titre: String(titre), preview, parsed };
}

export default function DayView({ currentDate }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [assistPost, setAssistPost] = useState<any | null>(null);

  const dayKey = formatDateKey(currentDate);

  useEffect(() => {
    async function load() {
      const data = await fetchPlannerPosts();
      setPosts(data);
    }
    load();
  }, []);

  const refreshPosts = async () => {
    const data = await fetchPlannerPosts();
    setPosts(data);
  };

  const updateManualStatus = async (id: number | string, status: "published" | "scheduled") => {
    const pid = String(id);
    const previous = posts;

    setPosts((prev) =>
      prev.map((p) =>
        String(p?.id) === pid
          ? {
              ...p,
              statut: status,
              status,
              published_at: status === "published" ? new Date().toISOString() : null,
            }
          : p
      )
    );

    try {
      try {
        await proxyJson(`/planner/posts/${pid}/manual-status`, { method: "PATCH", body: JSON.stringify({ status }) });
      } catch {
        await (api as any).patch(`/planner/posts/${pid}/manual-status`, { status });
      }
    } catch (e) {
      console.error("updateManualStatus error", e);
      setPosts(previous);
      throw e;
    }
  };

  const deletePlannerPost = async (id: number | string) => {
    const pid = String(id);

    setPosts((prev) => prev.filter((p) => String(p?.id) !== pid));

    const tryDelete = async (path: string) => {
      try {
        return await proxyJson(path, { method: "DELETE" });
      } catch {}

      const fn = (api as any)?.delete;
      if (typeof fn === "function") return await fn(path);

      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const url = base ? `${base}${path}` : path;
      const r = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error(`DELETE ${path} failed (${r.status})`);
      return await r.json().catch(() => ({}));
    };

    try {
      try {
        await tryDelete(`/planner/posts/${pid}`);
      } catch {
        await tryDelete(`/planner/${pid}`);
      }
    } catch (e) {
      console.error("deletePlannerPost error", e);
      const data = await fetchPlannerPosts();
      setPosts(data);
    }
  };

  const dayPosts = useMemo(() => {
    return posts.filter((p) => {
      const dt = p?.date_programmee ?? p?.scheduled_at ?? p?.scheduled_for ?? null;
      if (!dt) return false;
      return String(dt).split("T")[0] === dayKey;
    });
  }, [posts, dayKey]);

  const openPost = (post: any) => {
    const parsed = safeParseJSON(post?.contenu ?? post?.content ?? null);

    const kind = guessKind(post, parsed);
    if (kind === "carrousel") {
      try {
        const content = typeof post?.contenu === "string" ? JSON.parse(post.contenu) : parsed;
        const carrouselId = content?.carrousel_id ?? content?.carrouselId ?? content?.meta?.carrousel_id ?? null;
        if (!carrouselId) return;
        router.push(
          `/dashboard/automatisations/reseaux_sociaux/carrousel/editor/${carrouselId}?from=planner`
        );
      } catch {
        return;
      }
    } else {
      router.push(`/dashboard/automatisations/reseaux_sociaux/posts/${post.id}?from=planner`);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const label = currentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="mt-10 max-w-5xl mx-auto">
        <div className="mb-4 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-transparent px-4 py-3 text-sm text-white/80">
          <span className="font-semibold text-yellow-300">Publication assistée active.</span> LGD prépare le contenu,
          le visuel et le suivi du Planner. L’utilisateur final garde le clic “publier” sur le réseau.
        </div>

        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">
          Publications du jour — <span className="text-yellow-400 capitalize">{label}</span>
        </h2>

        {dayPosts.length === 0 && (
          <p className="text-sm text-gray-400 mb-6">Aucune publication programmée pour ce jour.</p>
        )}

        <div className="bg-[#0b0b0b] border border-[#252525] rounded-2xl p-4 md:p-6 shadow-xl shadow-black/60">
          <div className="space-y-4">
            {hours.map((h) => {
              const hourPrefix = String(h).padStart(2, "0");

              const postsAtHour = dayPosts.filter((p) => {
                const dt = p?.date_programmee ?? p?.scheduled_at ?? p?.scheduled_for ?? null;
                if (!dt) return false;
                return String(dt).includes(`T${hourPrefix}:`);
              });

              return (
                <div key={h} className="border-b border-[#1c1c1c] pb-4 last:border-none">
                  <div className="text-gray-500 text-sm mb-2">{hourPrefix}h</div>

                  {postsAtHour.length === 0 && (
                    <div className="bg-[#111111] border border-[#252525] rounded-xl px-3 py-2 text-gray-500 text-xs">
                      Aucun post à cette heure.
                    </div>
                  )}

                  {postsAtHour.map((post) => {
                    const meta = getPostTitleAndPreview(post);
                    const kind = guessKind(post, meta.parsed);
                    const sent = isSent(post, meta.parsed);

                    const networkKey = String(
                      post?.reseau ?? post?.network ?? meta.parsed?.reseau ?? meta.parsed?.network ?? ""
                    )
                      .toLowerCase()
                      .trim();

                    return (
                      <div key={post.id} className="relative mb-2 rounded-xl border border-transparent">
                        <button
                          onClick={() => openPost(post)}
                          className="w-full text-left bg-[#111111] border border-[#252525] rounded-xl px-4 py-3 pr-14 shadow-md hover:border-yellow-400/60 transition"
                        >
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {icons[networkKey] ?? <div className="w-2 h-2 rounded bg-white/30" />}

                            <span className="font-medium text-white text-sm">{meta.titre}</span>

                            <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-[2px] text-[10px] text-white/70">
                              {kind === "carrousel" ? "Carrousel" : "Post"}
                            </span>

                            {sent && (
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-[2px] text-[10px] text-emerald-200">
                                Envoyé avec succès
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 mb-2 truncate">{meta.preview}</p>

                          <div className="text-xs text-gray-500">
                            {String(post.date_programmee ?? post.scheduled_at ?? post.scheduled_for ?? "")
                              .split("T")[1]
                              ?.slice(0, 5) ?? "—"}
                          </div>
                        </button>

                        <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
                          <button
                            type="button"
                            onClick={() => setAssistPost(post)}
                            className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/15"
                          >
                            <CalendarCheck2 className="h-4 w-4" />
                            Publication assistée
                          </button>
                        </div>

                        <button
                          type="button"
                          title="Supprimer"
                          className="absolute right-3 top-[38px] -translate-y-1/2 h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:border-yellow-400/60 hover:bg-white/10 flex items-center justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const ok = window.confirm(
                              "Supprimer cette publication planifiée ?\n\nCette action est définitive."
                            );
                            if (!ok) return;
                            deletePlannerPost(post.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-white/70" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AssistedPublishModal
        open={!!assistPost}
        post={assistPost}
        onClose={() => setAssistPost(null)}
        onMarkStatus={async (postId, status) => {
          await updateManualStatus(postId, status);
          await refreshPosts();
        }}
      />
    </>
  );
}

