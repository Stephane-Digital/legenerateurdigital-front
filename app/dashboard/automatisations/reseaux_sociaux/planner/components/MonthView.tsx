"use client";

import api from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { formatDateKey, getMonthDays, isToday } from "../utils/date";

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

interface Props {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

const icons: Record<string, JSX.Element> = {
  instagram: <div className="w-2 h-2 rounded bg-pink-400" />,
  facebook: <div className="w-2 h-2 rounded bg-blue-500" />,
  linkedin: <div className="w-2 h-2 rounded bg-blue-400" />,
  tiktok: <div className="w-2 h-2 rounded bg-white" />,
  youtube: <div className="w-2 h-2 rounded bg-red-500" />,
};

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

function normNetwork(p: any): string {
  return String(p?.reseau ?? p?.network ?? p?.platform ?? "").toLowerCase().trim();
}

function normStatus(p: any): "draft" | "scheduled" | "published" | "error" {
  const raw = String(p?.statut ?? p?.status ?? "").toLowerCase();
  if (raw.includes("error") || raw.includes("erreur") || raw.includes("fail")) return "error";
  if (raw.includes("publish") || raw.includes("publi") || raw.includes("sent") || raw.includes("envoy")) return "published";
  if (raw.includes("sched") || raw.includes("program") || raw.includes("pend") ) return "scheduled";
  return "draft";
}

function statusBadgeClass(st: string) {
  if (st === "published") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (st === "scheduled") return "border-yellow-400/20 bg-yellow-500/10 text-yellow-200";
  if (st === "error") return "border-red-400/20 bg-red-500/10 text-red-200";
  return "border-white/10 bg-white/5 text-white/70";
}

function statusLabel(st: string, scheduledAt?: string) {
  // UX demandé: si un post "Programmé" est dans le passé, afficher "Publié".
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


export default function MonthView({ currentDate, onSelectDate }: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPlannerPosts();
      setPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  // ✅ FIX : getMonthDays attend (year, month)
  // et renvoie { date, isCurrentMonth, key }[]
  const days = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return getMonthDays(y, m);
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
      <div className="grid grid-cols-7 gap-3">
        {days.map((cell) => {
          const d = cell.date; // ✅ Date garanti
          const key = cell.key ?? formatDateKey(d);
          const dayPosts = postsByDay[key] ?? [];

          return (
            <button
              key={key}
              onClick={() => onSelectDate(d)}
              className={`relative rounded-2xl border p-4 text-left transition ${
                isToday(d)
                  ? "border-yellow-400/60 bg-yellow-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-sm font-semibold text-white">
                {String(d.getDate()).padStart(2, "0")}
              </div>

              {dayPosts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {dayPosts.slice(0, 2).map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-2 py-1"
                    >
                      {icons[normNetwork(p)] ?? (<div className="w-2 h-2 rounded bg-white/30" />)}
                      {(() => { const net = networkBadge(normNetwork(p)); const st = normStatus(p); return (
                      <>
                        <span className={`rounded-full border px-2 py-[1px] text-[10px] ${net.cls}`}>{net.label}</span>
                        <span className="text-[11px] text-white/80 truncate">{p.titre ?? p.title ?? "Post"}</span>
                        <span className={`ml-auto rounded-full border px-2 py-[1px] text-[9px] ${statusBadgeClass(st)}`}>{statusLabel(st, p.scheduled_at)}</span>
                      </>
                    ); })()}
                    </div>
                  ))}

                  {dayPosts.length > 2 && (
                    <div className="text-[10px] text-yellow-300/80">
                      +{dayPosts.length - 2}
                    </div>
                  )}
                </div>
              )}

              {loading && <div className="absolute inset-0 rounded-2xl bg-black/30" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

