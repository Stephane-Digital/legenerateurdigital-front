"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import CarrouselEditor from "./CarrouselEditor";
import PostEditor from "./PostEditor";

import { downloadEditorCreation } from "../utils/downloadEditorCreation";

type Mode = "post" | "carrousel";

// Coach brief bridge (Alex V2 -> Editor Intelligent)
const LS_COACH_BRIEF = "lgd_coach_brief";
const LS_ALEX_BRIEF = "lgd_alex_v2_brief";

// Brief "optimisation" (blocage) depuis Coach Alex V2 (OptimizeCard -> applyToEditor)
const LS_EDITOR_INTELLIGENT_BRIEF = "lgd_editor_intelligent_brief";

// Anti-régression: empêche d'afficher un brief déjà consommé
const LS_BRIEF_LAST_CONSUMED = "lgd_editor_brief_last_consumed";

const LS_POST = "lgd_editor_post_draft_v5";
const LS_CARROUSEL = "lgd_editor_carrousel_draft_v5";

// Dashboard progression bridge
const LS_DASHBOARD_DAILY_PROGRESS = "lgd_dashboard_daily_progress";

function safeJsonParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeText(t: string) {
  return (t || "").replace(/\s+/g, " ").trim();
}

function extractTextAndIdFromAny(raw: string | null): { text: string; id: string } | null {
  if (!raw) return null;
  if (raw === "[object Object]") return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    const text = normalizeText(trimmed);
    if (!text) return null;
    return { text, id: "s:" + text.slice(0, 60) };
  }

  try {
    const obj: any = JSON.parse(trimmed);

    const text =
      normalizeText(String(obj?.brief || obj?.text || obj?.message || obj?.description || obj?.content || "")) || "";

    if (!text) return null;

    const id =
      String(obj?.briefId || obj?.id || obj?.createdAtISO || "") ||
      "o:" + text.slice(0, 60);

    return { text, id };
  } catch {
    return null;
  }
}

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatNowForTitle() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

/**
 * ============================================================
 * ✅ ARCHIVE PREVIEWS — FIX CARROUSEL IMAGES
 * ------------------------------------------------------------
 * Problème: dans /dashboard/library, les previews carrousel
 * n'affichent que le texte (images en blob: non rehydratées).
 *
 * Solution: au moment de sauvegarder en bibliothèque,
 * on convertit TOUTES les URLs "blob:" présentes dans le draft
 * (runtimeImages + layers + slides + background, etc.) en dataURL.
 *
 * Post marchait déjà souvent; on généralise en "deep replace"
 * sans toucher au reste du système.
 * ============================================================
 */

async function blobUrlToDataUrl(blobUrl: string): Promise<string | null> {
  try {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(blob);
    });
    return dataUrl || null;
  } catch {
    return null;
  }
}

function collectBlobUrls(node: any, out: Set<string>) {
  if (!node) return;

  if (typeof node === "string") {
    if (node.startsWith("blob:")) out.add(node);
    return;
  }

  if (Array.isArray(node)) {
    for (const v of node) collectBlobUrls(v, out);
    return;
  }

  if (typeof node === "object") {
    if (node instanceof Date) return;

    for (const k of Object.keys(node)) {
      collectBlobUrls((node as any)[k], out);
    }
  }
}

function replaceBlobUrls(node: any, map: Map<string, string>): any {
  if (!node) return node;

  if (typeof node === "string") {
    if (node.startsWith("blob:")) return map.get(node) || node;
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((v) => replaceBlobUrls(v, map));
  }

  if (typeof node === "object") {
    if (node instanceof Date) return node;

    const out: any = Array.isArray(node) ? [] : {};
    for (const k of Object.keys(node)) {
      out[k] = replaceBlobUrls((node as any)[k], map);
    }
    return out;
  }

  return node;
}

async function prepareDraftForLibrary(draft: any): Promise<any> {
  if (!draft) return draft;

  const blobs = new Set<string>();
  collectBlobUrls(draft, blobs);

  if (blobs.size === 0) return draft;

  const replaceMap = new Map<string, string>();
  for (const blobUrl of Array.from(blobs)) {
    const dataUrl = await blobUrlToDataUrl(String(blobUrl));
    if (dataUrl && dataUrl.startsWith("data:")) {
      replaceMap.set(blobUrl, dataUrl);
    }
  }

  if (replaceMap.size === 0) return draft;
  return replaceBlobUrls(draft, replaceMap);
}

export default function EditorModeRouter() {
  const [mode, setMode] = useState<Mode>("post");
  const [brief, setBrief] = useState<string>("");

  const [archiving, setArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState<string>("");

  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string>("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("lgd_editor_mode") : null;
    if (saved === "post" || saved === "carrousel") setMode(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(LS_DASHBOARD_DAILY_PROGRESS);
      const parsed = raw ? JSON.parse(raw) : {};

      const updated = {
        idea: Boolean(parsed?.idea),
        content: true,
        email: Boolean(parsed?.email),
        offer: Boolean(parsed?.offer),
      };

      window.localStorage.setItem(LS_DASHBOARD_DAILY_PROGRESS, JSON.stringify(updated));
    } catch {
      window.localStorage.setItem(
        LS_DASHBOARD_DAILY_PROGRESS,
        JSON.stringify({
          idea: false,
          content: true,
          email: false,
          offer: false,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const sp = new URLSearchParams(window.location.search || "");
      const fromUrl = sp.get("brief") || "";
      const decoded = fromUrl ? normalizeText(decodeURIComponent(fromUrl)) : "";

      const lastConsumed = window.localStorage.getItem(LS_BRIEF_LAST_CONSUMED) || "";

      if (decoded) {
        setBrief(decoded);
        window.localStorage.setItem(LS_COACH_BRIEF, decoded);
        window.localStorage.setItem(LS_BRIEF_LAST_CONSUMED, "url:" + decoded.slice(0, 80));
        window.localStorage.removeItem(LS_EDITOR_INTELLIGENT_BRIEF);
        return;
      }

      const optim = extractTextAndIdFromAny(window.localStorage.getItem(LS_EDITOR_INTELLIGENT_BRIEF));
      if (optim) {
        if (optim.id && optim.id === lastConsumed) {
          setBrief("");
          window.localStorage.removeItem(LS_COACH_BRIEF);
        } else {
          setBrief(optim.text);
          window.localStorage.setItem(LS_COACH_BRIEF, optim.text);
          window.localStorage.setItem(LS_BRIEF_LAST_CONSUMED, optim.id);
        }
        window.localStorage.removeItem(LS_EDITOR_INTELLIGENT_BRIEF);
        return;
      }

      const missionRaw = window.localStorage.getItem(LS_ALEX_BRIEF) || window.localStorage.getItem(LS_COACH_BRIEF) || "";
      const mission = extractTextAndIdFromAny(missionRaw);

      if (mission) {
        if (mission.id && mission.id === lastConsumed) {
          setBrief("");
          window.localStorage.removeItem(LS_COACH_BRIEF);
        } else {
          setBrief(mission.text);
          window.localStorage.setItem(LS_COACH_BRIEF, mission.text);
          window.localStorage.setItem(LS_BRIEF_LAST_CONSUMED, mission.id);
        }
      } else {
        setBrief("");
        window.localStorage.removeItem(LS_COACH_BRIEF);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("lgd_editor_mode", mode);
  }, [mode]);

  const getDraft = () => {
    if (typeof window === "undefined") return null;
    const key = mode === "post" ? LS_POST : LS_CARROUSEL;
    return safeJsonParse(window.localStorage.getItem(key));
  };

  async function archiveToLibrary() {
    if (typeof window === "undefined") return;

    setArchiveMsg("");
    const draft = getDraft();

    if (!draft) {
      setArchiveMsg("Aucun draft à archiver.");
      return;
    }

    const base = apiBase();
    if (!base) {
      setArchiveMsg("NEXT_PUBLIC_API_URL manquant (impossible d’archiver).");
      return;
    }

    const kind = mode === "post" ? "lgd_post_v5" : "lgd_carrousel_v5";
    const title = `${mode === "post" ? "Post" : "Carrousel"} — ${formatNowForTitle()}`;

    setArchiving(true);
    try {
      const preparedDraft = await prepareDraftForLibrary(draft);

      const res = await fetch(`${base}/library/save-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          kind,
          title,
          data: { payload: preparedDraft },
        }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail = j?.detail || j?.message || "";
        } catch {
          // ignore
        }
        throw new Error(detail || `Erreur archive (HTTP ${res.status})`);
      }

      setArchiveMsg("✅ Archivé dans la Bibliothèque.");
    } catch (e: any) {
      setArchiveMsg(`❌ ${e?.message || "Erreur archive"}`);
    } finally {
      setArchiving(false);
      window.setTimeout(() => setArchiveMsg(""), 3000);
    }
  }

  async function downloadToPc() {
    if (typeof window === "undefined") return;

    setDownloadMsg("");
    const draft = getDraft();

    if (!draft) {
      setDownloadMsg("❌ Aucun contenu à télécharger (draft vide).");
      return;
    }

    setDownloading(true);
    try {
      await downloadEditorCreation({
        mode,
        draft,
        title: `${mode === "post" ? "Post" : "Carrousel"}-${formatNowForTitle()}`,
      });

      setDownloadMsg(
        mode === "post"
          ? "✅ Post téléchargé sur votre PC."
          : "✅ Carrousel téléchargé sur votre PC (une image par slide)."
      );
    } catch (e: any) {
      setDownloadMsg(`❌ ${e?.message || "Erreur téléchargement"}`);
    } finally {
      setDownloading(false);
      window.setTimeout(() => setDownloadMsg(""), 4000);
    }
  }

  const modeLabel = useMemo(() => (mode === "post" ? "POSTS" : "CARROUSEL"), [mode]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-6 pt-20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/coach-ia/v2"
              className="w-fit rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-black/40"
            >
              ← Retour vers Coach Alex
            </Link>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={archiveToLibrary}
                disabled={archiving}
                className="rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-black/40 disabled:opacity-60"
                title="Enregistre le draft actuel dans la Bibliothèque (server)"
              >
                {archiving ? "Archivage…" : "Archiver post/carrousel"}
              </button>

              <Link
                href="/dashboard/library"
                className="rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-black/40"
                title="Ouvrir la Bibliothèque"
              >
                📚 Archive
              </Link>

              <button
                type="button"
                onClick={downloadToPc}
                disabled={downloading}
                className="rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-black/40 disabled:opacity-60"
                title="Télécharger la création sur le PC"
              >
                {downloading ? "Téléchargement…" : "⬇️ Télécharger sur PC"}
              </button>
            </div>

            {archiveMsg ? <div className="text-xs text-white/70">{archiveMsg}</div> : null}
            {downloadMsg ? <div className="text-xs text-white/70">{downloadMsg}</div> : null}
          </div>
        </div>

        <h1 className="mt-20 text-center text-4xl font-extrabold text-[#ffb800]">L’Éditeur Intelligent + Copilote IA– {modeLabel}</h1>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setMode("post")}
            className={`rounded-xl px-5 py-2 text-sm font-semibold ${
              mode === "post" ? "bg-[#ffb800] text-black" : "border border-yellow-500/25 bg-black/30 text-yellow-200"
            }`}
          >
            Mode POST
          </button>

          <button
            onClick={() => setMode("carrousel")}
            className={`rounded-xl px-5 py-2 text-sm font-semibold ${
              mode === "carrousel" ? "bg-[#ffb800] text-black" : "border border-yellow-500/25 bg-black/30 text-yellow-200"
            }`}
          >
            Mode CARROUSEL
          </button>
        </div>
      </div>

      <div className="mx-auto mt-1 w-full max-w-[1800px] px-6 pb-16">
        {mode === "post" ? <PostEditor brief={brief} /> : <CarrouselEditor brief={brief} />}
      </div>
    </div>
  );
}
