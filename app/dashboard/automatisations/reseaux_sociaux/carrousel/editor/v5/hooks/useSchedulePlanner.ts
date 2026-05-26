"use client";

import { useCallback, useState } from "react";

type Network = "instagram" | "facebook" | "linkedin" | string;

type SchedulePayload = {
  // ✅ réseau
  reseau?: Network; // legacy
  network?: Network; // new

  // ✅ date/heure
  date_programmee?: string; // legacy ISO
  scheduled_at?: string; // new ISO

  // ✅ options
  statut?: string;
  supprimer_apres?: boolean;

  // ✅ metadata (optionnels)
  titre?: string;
  title?: string;
  format?: "post" | "carrousel" | string;
  archive?: boolean;

  // ✅ contenu (draft JSON)
  contenu?: any;
  content?: any;
  payload?: any;
  draft?: any;

  // ✅ carrousel (tolérance)
  carrousel_id?: number | string;
  slides?: any[];
};

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("lgd_token") ||
      localStorage.getItem("jwt") ||
      null
    );
  } catch {
    return null;
  }
}

const LS_PLANNER_LOCAL_POSTS = "lgd_planner_local_posts_v1";
const LS_EDITOR_MODE = "lgd_editor_mode";
const LS_EDITOR_MODE_V5_COMPAT = "lgd_editor_mode_v5";
const LS_POST = "lgd_editor_post_draft_v5";
const LS_CARROUSEL = "lgd_editor_carrousel_draft_v5";

function safeJsonParse(raw: string | null) {
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

function pickTitle(payload: SchedulePayload, isCarrousel: boolean): string {
  return String(
    payload.titre ??
      payload.title ??
      payload.contenu?.titre ??
      payload.contenu?.title ??
      payload.contenu?.ui?.title ??
      (isCarrousel ? "Carrousel LGD" : "Post LGD")
  ).trim();
}

function getPayloadContent(payload: SchedulePayload) {
  return (
    payload.contenu ??
    payload.content ??
    payload.payload ??
    payload.draft ??
    null
  );
}

function readCurrentEditorDraftFromLocalStorage(): any {
  if (typeof window === "undefined") return null;

  try {
    const mode =
      window.localStorage.getItem(LS_EDITOR_MODE) ||
      window.localStorage.getItem(LS_EDITOR_MODE_V5_COMPAT) ||
      "post";

    if (mode === "carrousel") {
      return safeJsonParse(window.localStorage.getItem(LS_CARROUSEL));
    }

    return safeJsonParse(window.localStorage.getItem(LS_POST));
  } catch {
    return null;
  }
}

function ensureFullContent(payload: SchedulePayload): any {
  const direct = getPayloadContent(payload);
  if (direct) return direct;
  return readCurrentEditorDraftFromLocalStorage();
}

function looksLikeCarrousel(payload: SchedulePayload, content?: any): boolean {
  if ((payload.format || "").toLowerCase() === "carrousel") return true;
  if (payload.carrousel_id != null) return true;
  if (Array.isArray(payload.slides) && payload.slides.length > 0) return true;

  const c = content ?? getPayloadContent(payload);
  if (c && typeof c === "object") {
    if (String(c.type || "").toLowerCase() === "carrousel") return true;
    if (String(c.format || "").toLowerCase() === "carrousel") return true;
    if (c.carrousel_id != null) return true;
    if (Array.isArray(c.slides) && c.slides.length > 0) return true;
  }

  return false;
}

function extractCarrouselSlides(payload: SchedulePayload, content: any) {
  const slides =
    payload.slides ??
    content?.slides ??
    content?.carrousel?.slides ??
    content?.draft?.slides ??
    [];

  return Array.isArray(slides) ? slides : [];
}

function buildLocalPost(args: {
  data: any;
  payload: SchedulePayload;
  content: any;
  network: string;
  scheduledAt: string;
  isCarrousel: boolean;
}) {
  const { data, payload, content, network, scheduledAt, isCarrousel } = args;
  const dataObj = typeof data === "object" && data ? data : {};
  const apiPost =
    dataObj?.post && typeof dataObj.post === "object"
      ? dataObj.post
      : dataObj?.item && typeof dataObj.item === "object"
      ? dataObj.item
      : dataObj;

  const localId =
    apiPost?.id ??
    dataObj?.id ??
    `local-planner-${Date.now()}`;

  const title =
    apiPost?.titre ??
    apiPost?.title ??
    dataObj?.titre ??
    dataObj?.title ??
    pickTitle(payload, isCarrousel);

  return {
    ...dataObj,
    ...apiPost,
    id: localId,
    local_id: localId,
    reseau: apiPost?.reseau ?? apiPost?.network ?? dataObj?.reseau ?? dataObj?.network ?? network,
    network: apiPost?.network ?? apiPost?.reseau ?? dataObj?.network ?? dataObj?.reseau ?? network,
    date_programmee:
      apiPost?.date_programmee ??
      apiPost?.scheduled_at ??
      dataObj?.date_programmee ??
      dataObj?.scheduled_at ??
      scheduledAt,
    scheduled_at:
      apiPost?.scheduled_at ??
      apiPost?.date_programmee ??
      dataObj?.scheduled_at ??
      dataObj?.date_programmee ??
      scheduledAt,
    titre: title,
    title,
    format:
      apiPost?.format ??
      dataObj?.format ??
      payload.format ??
      (isCarrousel ? "carrousel" : "post"),
    statut:
      apiPost?.statut ??
      apiPost?.status ??
      dataObj?.statut ??
      dataObj?.status ??
      payload.statut ??
      "scheduled",
    status:
      apiPost?.status ??
      apiPost?.statut ??
      dataObj?.status ??
      dataObj?.statut ??
      payload.statut ??
      "scheduled",
    contenu:
      apiPost?.contenu ??
      apiPost?.content ??
      dataObj?.contenu ??
      dataObj?.content ??
      content ??
      null,
    content:
      apiPost?.content ??
      apiPost?.contenu ??
      dataObj?.content ??
      dataObj?.contenu ??
      content ??
      null,
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

    // ✅ si token dispo : Authorization Bearer (en plus des cookies httpOnly)
    if (token) headers.Authorization = `Bearer ${token}`;

    const network = pickNetwork(payload);
    const scheduledAt = pickScheduledAt(payload);
    const content = ensureFullContent(payload);
    const isCarrousel = looksLikeCarrousel(payload, content);
    const title = pickTitle({ ...payload, contenu: content }, isCarrousel);
    const slides = extractCarrouselSlides(payload, content);

    try {
      const endpoint = isCarrousel ? "/planner/schedule-carrousel" : "/planner/schedule-post";

      // ✅ CRITIQUE LGD
      // On envoie les deux conventions :
      // - legacy backend/planner : reseau + date_programmee + contenu
      // - compat récente : network + scheduled_at + content
      // Cela évite que l’élément soit bien créé mais invisible dans le Planner.
      const body = isCarrousel
        ? {
            reseau: network,
            network,
            date_programmee: scheduledAt,
            scheduled_at: scheduledAt,
            supprimer_apres: !!payload.supprimer_apres,

            carrousel_id:
              payload.carrousel_id ??
              content?.carrousel_id ??
              content?.id ??
              null,
            slides,
            contenu: content ?? null,
            content: content ?? null,
            titre: title,
            title,
            format: "carrousel",
            statut: payload.statut ?? "scheduled",
            status: payload.statut ?? "scheduled",
          }
        : {
            reseau: network,
            network,
            date_programmee: scheduledAt,
            scheduled_at: scheduledAt,
            supprimer_apres: !!payload.supprimer_apres,

            titre: title,
            title,
            format: payload.format ?? "post",
            contenu: content ?? null,
            content: content ?? null,
            statut: payload.statut ?? "scheduled",
            status: payload.statut ?? "scheduled",
          };

      const res = await fetch(`${getApiBase()}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        // ✅ CRITIQUE : envoie les cookies httpOnly (session/JWT cookie)
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

      // ✅ Local mirror: keeps Planner visible immediately even if the
      // production list endpoint temporarily filters/omits the new item.
      safeWritePlannerLocalPost(
        buildLocalPost({
          data,
          payload: { ...payload, titre: title, contenu: content },
          content,
          network,
          scheduledAt,
          isCarrousel,
        })
      );

      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedule, loading };
}

export default useSchedulePlanner;
