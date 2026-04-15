"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

const LS_EDITOR_MODE = "lgd_editor_mode";
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
    window.localStorage.getItem("lgd_token") ||
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

type AnyObj = Record<string, any>;

function safeJsonParseAny(v: any) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

function normalizeArchivePayload(raw: any): AnyObj {
  const payload = safeJsonParseAny(raw) as AnyObj;
  const candidates = [payload?.draft, payload?.payload, payload?.content, payload].filter(Boolean);

  for (const c of candidates) {
    if (c?.canvas?.layers || c?.layers || c?.slides || c?.carrousel?.slides) return c;
  }

  return payload || {};
}

function extractArchivePostDraft(payloadLike: any) {
  const p = normalizeArchivePayload(payloadLike);
  const layers =
    p?.layers ??
    p?.canvas?.layers ??
    p?.data?.layers ??
    p?.content?.layers ??
    p?.draft?.layers ??
    p?.draft?.canvas?.layers ??
    [];

  return {
    ui: p?.ui ?? p?.draft?.ui ?? undefined,
    layers: Array.isArray(layers) ? layers : [],
  };
}

function extractArchiveCarrouselDraft(payloadLike: any) {
  const p = normalizeArchivePayload(payloadLike);
  const rawSlides =
    p?.slides ??
    p?.carrousel?.slides ??
    p?.draft?.slides ??
    p?.draft?.carrousel?.slides ??
    p?.data?.slides ??
    [];

  const slides = (Array.isArray(rawSlides) ? rawSlides : []).map((slide: any, index: number) => {
    const layers =
      slide?.layers ??
      slide?.canvas?.layers ??
      slide?.data?.layers ??
      slide?.payload?.layers ??
      [];

    return {
      id: String(slide?.id || `slide-${index + 1}`),
      layers: Array.isArray(layers) ? layers : [],
    };
  });

  return {
    ui: p?.ui ?? p?.draft?.ui ?? undefined,
    slides,
  };
}

async function fetchArchiveRawById(id: string) {
  const base = apiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL manquant");

  const urls = [
    `${base}/library/raw/${id}`,
    `${base}/library/${id}/raw`,
    `${base}/library/items/${id}/raw`,
  ];

  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });

      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }

      return await res.json().catch(() => null);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Impossible de charger l’archive.");
}

export default function EditorModeRouter() {
  const [mode, setMode] = useState<Mode>("post");
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPhone, setIsPhone] = useState(false);
  const [mobileArchiveMsg, setMobileArchiveMsg] = useState("");
  const [mobileUploading, setMobileUploading] = useState(false);
  const [brief, setBrief] = useState<string>("");

  const [archiving, setArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState<string>("");

  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string>("");

  const [loadingArchiveSelection, setLoadingArchiveSelection] = useState(false);
  const [archiveSelectionError, setArchiveSelectionError] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("lgd_editor_mode") : null;
    if (saved === "post" || saved === "carrousel") setMode(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search || "");
    const openLibrary = sp.get("openLibrary");
    const archiveId = (sp.get("id") || "").trim();
    const archiveKind = (sp.get("kind") || "").trim().toLowerCase();

    if (openLibrary !== "1" || !archiveId || (archiveKind !== "post" && archiveKind !== "carrousel")) {
      setArchiveSelectionError("");
      setLoadingArchiveSelection(false);
      return;
    }

    let cancelled = false;

    async function hydrateSelectedArchive() {
      setLoadingArchiveSelection(true);
      setArchiveSelectionError("");

      try {
        const raw = await fetchArchiveRawById(archiveId);
        if (cancelled) return;

        const payloadRaw = raw?.payload ?? raw?.generated_content ?? raw?.data ?? raw ?? null;

        if (archiveKind === "post") {
          const draft = extractArchivePostDraft(payloadRaw);
          window.localStorage.setItem(LS_EDITOR_MODE, "post");
          window.localStorage.setItem(LS_POST, JSON.stringify(draft));
          setMode("post");
        } else {
          const draft = extractArchiveCarrouselDraft(payloadRaw);
          window.localStorage.setItem(LS_EDITOR_MODE, "carrousel");
          window.localStorage.setItem(LS_CARROUSEL, JSON.stringify(draft));
          if (draft?.slides?.[0]?.id) {
            window.localStorage.setItem("lgd_editor_carrousel_active_slide_v5", String(draft.slides[0].id));
          }
          setMode("carrousel");
        }
      } catch (e: any) {
        if (cancelled) return;
        setArchiveSelectionError(e?.message || "Impossible de charger cette archive dans l’éditeur.");
      } finally {
        if (!cancelled) setLoadingArchiveSelection(false);
      }
    }

    hydrateSelectedArchive();
    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => setIsPhone(window.innerWidth < 640);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const getDraft = () => {
    if (typeof window === "undefined") return null;
    const key = mode === "post" ? LS_POST : LS_CARROUSEL;
    return safeJsonParse(window.localStorage.getItem(key));
  };

  async function archiveMobilePhoto(file: File) {
    if (typeof window === "undefined") return;
    const base = apiBase();
    if (!base) {
      setMobileArchiveMsg("NEXT_PUBLIC_API_URL manquant.");
      return;
    }

    setMobileUploading(true);
    setMobileArchiveMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", `Photo mobile — ${formatNowForTitle()}`);

      const res = await fetch(`${base}/library/upload`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail = j?.detail || j?.message || "";
        } catch {}
        throw new Error(detail || `Erreur archive (HTTP ${res.status})`);
      }

      setMobileArchiveMsg("✅ Photo archivée dans LGD.");
    } catch (e: any) {
      setMobileArchiveMsg(`❌ ${e?.message || "Erreur archive photo"}`);
    } finally {
      setMobileUploading(false);
      window.setTimeout(() => setMobileArchiveMsg(""), 3500);
    }
  }

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

  if (loadingArchiveSelection) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto w-full max-w-[980px] px-6 pt-28 pb-16">
          <div className="rounded-3xl border border-yellow-500/20 bg-black/40 p-8 text-center shadow-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-yellow-200">Bibliothèque LGD</div>
            <h1 className="mt-3 text-3xl font-extrabold text-[#ffb800]">Chargement de l’archive sélectionnée…</h1>
            <p className="mt-3 text-sm text-white/70">
              LGD prépare votre contenu archivé pour l’ouvrir dans le Canva avec la bonne sélection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isPhone) {
    return (
      <div className="min-h-screen bg-black text-white">
        <input
          ref={mobileFileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            if (!file) return;
            await archiveMobilePhoto(file);
          }}
        />

        <div className="mx-auto w-full max-w-[640px] px-4 pb-10 pt-24">
          <div className="rounded-[28px] border border-yellow-500/15 bg-black/40 p-5 shadow-2xl">
            <div className="mb-3 inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-200">
              📱 Mode mobile LGD
            </div>

            <h1 className="text-[24px] font-extrabold leading-[1.12] text-[#ffb800]">
              Capture rapide pour vos archives
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/75">
              Sur mobile, LGD passe en mode compagnon. Prenez une photo ou importez un visuel,
              puis retrouvez-le dans vos archives pour le réutiliser sur ordinateur ou tablette.
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => mobileFileInputRef.current?.click()}
                disabled={mobileUploading}
                className="w-full rounded-2xl bg-[#ffb800] px-4 py-4 text-base font-semibold text-black disabled:opacity-60"
              >
                {mobileUploading ? "Archivage…" : "📸 Prendre une photo / importer"}
              </button>

              <Link
                href="/dashboard/library"
                className="w-full rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-4 text-center text-sm font-medium text-yellow-200"
              >
                📂 Ouvrir mes archives
              </Link>
            </div>

            {mobileArchiveMsg ? (
              <div className="mt-4 text-sm text-white/80">{mobileArchiveMsg}</div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
              <div className="text-sm font-semibold text-yellow-300">Comment ça marche</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">
                <li>• prenez une photo ou choisissez un visuel</li>
                <li>• LGD l’archive dans votre bibliothèque</li>
                <li>• ouvrez ensuite l’image sur ordinateur pour l’utiliser dans l’éditeur</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {archiveSelectionError ? <div className="text-xs text-red-300">{archiveSelectionError}</div> : null}
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
