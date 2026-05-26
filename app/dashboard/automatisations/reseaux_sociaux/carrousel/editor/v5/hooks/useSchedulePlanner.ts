"use client";

import { useCallback, useState } from "react";

type Network = "instagram" | "facebook" | "linkedin" | string;

type SchedulePayload = {
  reseau?: Network;
  network?: Network;
  date_programmee?: string;
  scheduled_at?: string;
  statut?: string;
  status?: string;
  supprimer_apres?: boolean;
  titre?: string;
  title?: string;
  format?: "post" | "carrousel" | string;
  archive?: boolean;
  contenu?: any;
  content?: any;
  payload?: any;
  carrousel_id?: number | string;
  slides?: any[];
};

const LS_PLANNER_LOCAL_POSTS = "lgd_planner_local_posts_v1";

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem("access_token") ||
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("lgd_token") ||
      window.localStorage.getItem("jwt") ||
      null
    );
  } catch {
    return null;
  }
}

function safeParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeReadPlannerLocalPosts(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_PLANNER_LOCAL_POSTS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWritePlannerLocalPost(post: any) {
  if (typeof window === "undefined" || !post) return;
  try {
    const current = safeReadPlannerLocalPosts();
    const id = String(post?.id ?? post?.local_id ?? "");
    const withoutSame = id
      ? current.filter((item) => String(item?.id ?? item?.local_id ?? "") !== id)
      : current;
    const next = [post, ...withoutSame].slice(0, 300);
    window.localStorage.setItem(LS_PLANNER_LOCAL_POSTS, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("lgd-planner-updated", { detail: post }));
    window.dispatchEvent(new Event("storage"));
  } catch {
    // no-op
  }
}

function pickNetwork(payload: SchedulePayload): string {
  return String(payload.network || payload.reseau || "instagram").toLowerCase().trim();
}

function pickScheduledAt(payload: SchedulePayload): string {
  return String(payload.scheduled_at || payload.date_programmee || "").trim();
}

function pickContent(payload: SchedulePayload) {
  if (payload.contenu) return payload.contenu;
  if (payload.content) return payload.content;
  if (payload.payload) return payload.payload;

  if (typeof window === "undefined") return null;

  try {
    const mode =
      window.localStorage.getItem("lgd_editor_mode") ||
      window.localStorage.getItem("lgd_editor_mode_v5") ||
      "post";

    if (mode === "carrousel") {
      return safeParse(window.localStorage.getItem("lgd_editor_carrousel_draft_v5"));
    }

    return safeParse(window.localStorage.getItem("lgd_editor_post_draft_v5"));
  } catch {
    return null;
  }
}

function looksLikeCarrousel(payload: SchedulePayload, content: any): boolean {
  if (String(payload.format || "").toLowerCase() === "carrousel") return true;
  if (payload.carrousel_id != null) return true;
  if (Array.isArray(payload.slides) && payload.slides.length > 0) return true;

  if (content && typeof content === "object") {
    if (String(content.type || content.kind || content.format || "").toLowerCase().includes("carrousel")) return true;
    if (content.carrousel_id != null) return true;
    if (Array.isArray(content.slides) && content.slides.length > 0) return true;
  }

  return false;
}

function buildLocalPost(args: {
  id?: any;
  network: string;
  scheduled_at: string;
  title: string;
  format: string;
  content: any;
  status?: string;
}) {
  const id = args.id ?? `local-planner-${Date.now()}`;
  return {
    id,
    local_id: id,
    reseau: args.network,
    network: args.network,
    date_programmee: args.scheduled_at,
    scheduled_at: args.scheduled_at,
    scheduled_for: args.scheduled_at,
    titre: args.title,
    title: args.title,
    format: args.format,
    statut: args.status || "scheduled",
    status: args.status || "scheduled",
    contenu: args.content,
    content: args.content,
  };
}

export function useSchedulePlanner() {
  const [loading, setLoading] = useState(false);

  const schedule = useCallback(async (payload: SchedulePayload) => {
    setLoading(true);

    const token = getTokenFromStorage();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const network = pickNetwork(payload);
    const scheduled_at = pickScheduledAt(payload);
    const content = pickContent(payload);
    const isCarrousel = looksLikeCarrousel(payload, content);
    const title =
      payload.titre ||
      payload.title ||
      content?.title ||
      content?.titre ||
      (isCarrousel ? "Carrousel LGD" : "Post LGD");
    const format = payload.format || (isCarrousel ? "carrousel" : "post");

    const optimisticLocal = buildLocalPost({
      network,
      scheduled_at,
      title,
      format,
      content,
      status: payload.statut || payload.status || "scheduled",
    });

    // ✅ Sécurité UX : l'entrée est visible dans le Planner immédiatement,
    // même si Render/Vercel met du temps à la renvoyer dans /planner/posts.
    safeWritePlannerLocalPost(optimisticLocal);

    try {
      const endpoint = isCarrousel ? "/planner/schedule-carrousel" : "/planner/schedule-post";

      const body = isCarrousel
        ? {
            network,
            reseau: network,
            scheduled_at,
            date_programmee: scheduled_at,
            scheduled_for: scheduled_at,
            supprimer_apres: !!payload.supprimer_apres,
            carrousel_id: payload.carrousel_id ?? content?.carrousel_id ?? content?.id ?? null,
            slides: payload.slides ?? content?.slides ?? [],
            titre: title,
            title,
            format,
            contenu: content ?? null,
            content: content ?? null,
          }
        : {
            network,
            reseau: network,
            scheduled_at,
            date_programmee: scheduled_at,
            scheduled_for: scheduled_at,
            supprimer_apres: !!payload.supprimer_apres,
            titre: title,
            title,
            format,
            contenu: content ?? null,
            content: content ?? null,
          };

      const res = await fetch(`${getApiBase()}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (res.status === 401) {
        throw new Error("Non authentifié (401) — cookies/token non envoyés ou expirés.");
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Erreur API (${res.status}) ${text || ""}`.trim());
      }

      const data = await res.json().catch(() => null);
      const returned =
        data && typeof data === "object"
          ? data.post ?? data.item ?? data.publication ?? data.data ?? data
          : null;

      const finalLocal = buildLocalPost({
        id: returned?.id ?? data?.id ?? optimisticLocal.id,
        network: returned?.network ?? returned?.reseau ?? data?.network ?? data?.reseau ?? network,
        scheduled_at:
          returned?.date_programmee ??
          returned?.scheduled_at ??
          data?.date_programmee ??
          data?.scheduled_at ??
          scheduled_at,
        title: returned?.titre ?? returned?.title ?? data?.titre ?? data?.title ?? title,
        format: returned?.format ?? data?.format ?? format,
        content: returned?.contenu ?? returned?.content ?? data?.contenu ?? data?.content ?? content,
        status: returned?.statut ?? returned?.status ?? data?.statut ?? data?.status ?? "scheduled",
      });

      safeWritePlannerLocalPost(finalLocal);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedule, loading };
}

export default useSchedulePlanner;
