"use client";

import api, { isAuthError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getWeekDays, isToday } from "../utils/date";

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
};

interface Props {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

async function fetchPlannerPosts() {
  try {
    const data = await proxyJson("/planner/posts");
    if (Array.isArray(data)) return data;
  } catch (error) {
    if (isAuthError(error)) return [];
  }

  try {
    const data2 = await proxyJson("/social-posts");
    return Array.isArray(data2) ? data2 : [];
  } catch (error) {
    if (isAuthError(error)) return [];
    return [];
  }
}

function normNetwork(p: any): string {
  return String(p?.reseau ?? p?.network ?? p?.platform ?? "").toLowerCase().trim();
}

function normStatus(p: any): "draft" | "scheduled" | "published" | "error" {
  const raw = String(p?.statut ?? p?.status ?? "").toLowerCase();
  if (raw.includes("error") || raw.includes("erreur") || raw.includes("fail")) return "error";
  if (raw.includes("publish") || raw.includes("publi") || raw.includes("sent") || raw.includes("envoy")) return "published";
  if (raw.includes("sched") || raw.includes("program") || raw.includes("pend")) return "scheduled";
  return "draft";
}

function statusBadgeClass(st: string) {
  if (st === "published") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (st === "scheduled") return "border-yellow-400/20 bg-yellow-500/10 text-yellow-200";
  if (st === "error") return "border-red-400/20 bg-red-500/10 text-red-200";
  return "border-white/10 bg-white/5 text-white/70";
}

function statusLabel(st: string, scheduledAt?: string) {
  try {
    if (st === "scheduled" && scheduledAt) {
      const dt = new Date(scheduledAt);
      if (!Number.isNaN(dt.getTime()) && dt.getTime() < Date.now()) return "Publié";
    }
  } catch {}

  if (st === "published") return "Publié";
  if (st === "error") return "Erreur";
  return "futur";
}

function networkBadge(n: string) {
  const v = String(n || "").toLowerCase();
  if (v === "instagram") return { label: "IG", cls: "border-pink-400/20 bg-pink-500/10 text-pink-200" };
  if (v === "facebook") return { label: "FB", cls: "border-blue-400/20 bg-blue-500/10 text-blue-200" };
  if (v === "linkedin") return { label: "IN", cls: "border-blue-400/20 bg-blue-500/10 text-blue-200" };
  return { label: (v || "—").slice(0, 3).toUpperCase(), cls: "border-white/10 bg-white/5 text-white/70" };
}

export default function WeekView({ currentDate, onSelectDate }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchPlannerPosts();
        if (!cancelled) {
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(() => {
    const raw = getWeekDays(currentDate);
    return Array.isArray(raw) ? raw : [];
  }, [currentDate]);

  const postsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const post of posts) {
      const dt = post?.date_programmee ?? post?.scheduled_at ?? post?.scheduled_for ?? null;
      if (!dt) continue;
      const key = String(dt).split("T")[0];
      map[key] = map[key] ? [...map[key], post] : [post];
    }
    return map;
  }, [posts]);

  return (
    <div className="mt-10 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((cell) => {
          const d = cell.date;
          const key = cell.key;
          const dayPosts = postsByDay[key] ?? [];

          return (
            <button
              key={key}
              onClick={() => onSelectDate(d)}
              className={`rounded-2xl border p-4 text-left transition ${
                isToday(d)
                  ? "border-yellow-400/60 bg-yellow-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-sm font-semibold text-white">
                {d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" })}
              </div>

              <div className="mt-3 space-y-2">
                {loading ? (
                  <div className="text-xs text-white/40">Chargement…</div>
                ) : dayPosts.length === 0 ? (
                  <div className="text-xs text-white/40">Aucun</div>
                ) : (
                  dayPosts.slice(0, 3).map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-2 py-2"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/dashboard/automatisations/reseaux_sociaux/planner?day=${key}`);
                      }}
                    >
                      {icons[normNetwork(p)] ?? <div className="w-2 h-2 rounded bg-white/30" />}
                      {(() => {
                        const net = networkBadge(normNetwork(p));
                        const st = normStatus(p);
                        return (
                          <>
                            <span className={`rounded-full border px-2 py-[1px] text-[10px] ${net.cls}`}>{net.label}</span>
                            <span className="text-[11px] text-white/80 truncate">{p.titre ?? p.title ?? "Post"}</span>
                            <span className={`ml-auto rounded-full border px-2 py-[1px] text-[9px] ${statusBadgeClass(st)}`}>
                              {statusLabel(st, p.scheduled_at)}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  ))
                )}

                {!loading && dayPosts.length > 3 && (
                  <div className="text-[10px] text-yellow-300/80">+{dayPosts.length - 3}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

