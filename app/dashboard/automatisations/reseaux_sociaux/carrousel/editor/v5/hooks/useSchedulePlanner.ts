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
  format?: "post" | "carrousel" | string;
  archive?: boolean;

  // ✅ contenu (draft JSON)
  contenu?: any;

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

function pickNetwork(payload: SchedulePayload): string {
  return String(payload.network || payload.reseau || "instagram").toLowerCase().trim();
}

function pickScheduledAt(payload: SchedulePayload): string {
  return String(payload.scheduled_at || payload.date_programmee || "").trim();
}

function looksLikeCarrousel(payload: SchedulePayload): boolean {
  if ((payload.format || "").toLowerCase() === "carrousel") return true;
  if (payload.carrousel_id != null) return true;
  if (Array.isArray(payload.slides) && payload.slides.length > 0) return true;

  const c = payload.contenu;
  if (c && typeof c === "object") {
    if (String(c.type || "").toLowerCase() === "carrousel") return true;
    if (c.carrousel_id != null) return true;
    if (Array.isArray(c.slides) && c.slides.length > 0) return true;
  }
  return false;
}

function safeReadDraft(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function ensureFullEditorPayload(payload: SchedulePayload) {
  if (payload.contenu || typeof window === "undefined") return payload;

  try {
    const mode =
      localStorage.getItem("lgd_editor_mode") ||
      localStorage.getItem("lgd_editor_mode_v5") ||
      "post";

    if (mode === "carrousel") {
      const draft = safeReadDraft("lgd_editor_carrousel_draft_v5");
      if (draft) payload.contenu = draft;
      return payload;
    }

    const draft = safeReadDraft("lgd_editor_post_draft_v5");
    if (draft) payload.contenu = draft;
  } catch {
    // no-op
  }

  return payload;
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

    const safePayload = ensureFullEditorPayload({ ...payload });
    const network = pickNetwork(safePayload);
    const scheduled_at = pickScheduledAt(safePayload);

    try {
      const isCarrousel = looksLikeCarrousel(safePayload);

      const endpoint = isCarrousel ? "/planner/schedule-carrousel" : "/planner/schedule-post";

      const body = isCarrousel
        ? {
            network,
            scheduled_at,
            supprimer_apres: !!safePayload.supprimer_apres,

            // tolérances carrousel
            carrousel_id:
              safePayload.carrousel_id ??
              safePayload.contenu?.carrousel_id ??
              safePayload.contenu?.id ??
              null,
            slides: safePayload.slides ?? safePayload.contenu?.slides ?? [],
            contenu: safePayload.contenu ?? null,
            titre: safePayload.titre ?? null,
          }
        : {
            network,
            scheduled_at,
            supprimer_apres: !!safePayload.supprimer_apres,

            // post
            titre: safePayload.titre ?? null,
            format: safePayload.format ?? "post",
            contenu: safePayload.contenu ?? null,
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
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedule, loading };
}

export default useSchedulePlanner;
