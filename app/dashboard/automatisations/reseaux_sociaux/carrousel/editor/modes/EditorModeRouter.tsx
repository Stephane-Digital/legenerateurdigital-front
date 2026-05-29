"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CarrouselEditor from "./CarrouselEditor";
import PostEditor from "./PostEditor";

import { downloadEditorCreation, renderEditorCreationToDataUrl } from "../utils/downloadEditorCreation";
import SchedulePlannerModal from "../ui/SchedulePlannerModal";
import useSchedulePlanner from "../v5/hooks/useSchedulePlanner";

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
const LS_CMO_AUTO_PAYLOAD = "lgd_cmo_module_auto_payload";
const LGD_EDITOR_LOAD_DRAFT_EVENT = "lgd:editor:load-draft";

function safeJsonParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}


const LGD_IDB_NAME = "lgd_editor_persistence_v1";
const LGD_IDB_STORE = "drafts";

function openEditorDraftDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = window.indexedDB.open(LGD_IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LGD_IDB_STORE)) {
        db.createObjectStore(LGD_IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function idbSetEditorDraft(key: string, value: any) {
  const db = await openEditorDraftDB();
  if (!db) return false;

  return await new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(LGD_IDB_STORE, "readwrite");
      tx.objectStore(LGD_IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  }).finally(() => {
    try {
      db.close();
    } catch {
      // ignore
    }
  });
}

async function idbGetEditorDraft(key: string) {
  const db = await openEditorDraftDB();
  if (!db) return null;

  return await new Promise<any>((resolve) => {
    try {
      const tx = db.transaction(LGD_IDB_STORE, "readonly");
      const req = tx.objectStore(LGD_IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
      tx.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  }).finally(() => {
    try {
      db.close();
    } catch {
      // ignore
    }
  });
}

function isIndexedDbDraftMarker(value: any) {
  return !!value && typeof value === "object" && value.__lgd_idb_draft__ === true;
}

function cleanupEditorLocalStorageForQuota(keepKey: string) {
  if (typeof window === "undefined") return;

  const keep = new Set([
    keepKey,
    "access_token",
    "token",
    "jwt",
    "lgd_token",
    "lgd_editor_mode",
    "lgd_editor_mode_v5",
  ]);

  const removable: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i) || "";
    if (!key || keep.has(key)) continue;
    if (
      key.startsWith("lgd_planner_local_") ||
      key.includes("runtime") ||
      key.includes("preview") ||
      key.includes("thumbnail") ||
      key.includes("archive_raw_cache") ||
      key.includes("image_cache") ||
      key.includes("draft_v5")
    ) {
      removable.push(key);
    }
  }

  for (const key of removable) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

async function safePersistEditorDraft(key: string, draft: any) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(draft ?? {});

  try {
    window.localStorage.setItem(key, raw);
    await idbSetEditorDraft(key, draft);
    return;
  } catch {
    // quota cleanup, then retry once
  }

  cleanupEditorLocalStorageForQuota(key);

  try {
    window.localStorage.setItem(key, raw);
    await idbSetEditorDraft(key, draft);
    return;
  } catch {
    // Heavy images are stored in IndexedDB; localStorage keeps only a tiny marker.
  }

  const storedInIdb = await idbSetEditorDraft(key, draft);
  if (storedInIdb) {
    try {
      window.localStorage.setItem(key, JSON.stringify({ __lgd_idb_draft__: true, key }));
    } catch {
      // ignore
    }
  }
}


function normalizeText(t: string) {
  return (t || "").replace(/\s+/g, " ").trim();
}

function buildCmoEditorBrief(payload: any) {
  const generated = payload?.generated_content || {};

  const parts = [
    payload?.priority_action ? `Action prioritaire : ${payload.priority_action}` : "",
    payload?.diagnostic ? `Diagnostic CMO : ${payload.diagnostic}` : "",
    payload?.why_this_action ? `Pourquoi maintenant : ${payload.why_this_action}` : "",
    payload?.next_best_action ? `Prochaine meilleure action : ${payload.next_best_action}` : "",
    generated?.post ? `Contenu suggéré : ${generated.post}` : "",
    generated?.cta ? `CTA : ${generated.cta}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return parts || "Créer un contenu marketing clair, premium, humain et orienté conversion pour Le Générateur Digital.";
}

function detectCmoEditorMode(payload: any): Mode {
  const generated = payload?.generated_content || {};
  const text = [
    payload?.priority_action,
    payload?.next_best_action,
    generated?.post,
    generated?.cta,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("carrousel") || text.includes("carousel") ? "carrousel" : "post";
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

function normalizeLayers(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return [];
    try {
      return normalizeLayers(JSON.parse(s));
    } catch {
      return [];
    }
  }

  if (typeof input === "object") {
    if (Array.isArray(input.layers)) return input.layers;
    if (Array.isArray(input.json_layers)) return input.json_layers;
    if (typeof input.layers === "string") return normalizeLayers(input.layers);
    if (typeof input.json_layers === "string") return normalizeLayers(input.json_layers);
  }

  return [];
}

function firstArray(...values: any[]): any[] {
  for (const value of values) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      const parsed = safeJsonParseAny(value);
      if (Array.isArray(parsed)) return parsed;
    }
  }
  return [];
}

function restoreArchivedLineBreaksInLayers(layers: any[]): any[] {
  return (Array.isArray(layers) ? layers : []).map((layer: any) => {
    if (!layer || typeof layer !== "object") return layer;
    if (layer.type !== "text") return layer;
    if (typeof layer.text !== "string") return layer;
    return {
      ...layer,
      text: layer.text.replace(/\\n/g, "\n"),
    };
  });
}

function extractSlideLayers(slide: any): any[] {
  return normalizeLayers(
    slide?.layers ||
      slide?.canvas?.layers ||
      slide?.data?.layers ||
      slide?.content?.layers ||
      slide?.payload?.layers ||
      slide?.elements ||
      []
  );
}

function unwrapSavedPayload(root: any) {
  const roots: any[] = [];
  const seen = new Set<any>();

  const visit = (node: any) => {
    const parsed = safeJsonParseAny(node);
    if (!parsed || typeof parsed !== "object") return;
    if (seen.has(parsed)) return;
    seen.add(parsed);
    roots.push(parsed);

    visit(parsed.payload);
    visit(parsed.data);
    visit(parsed.draft);
    visit(parsed.content);
    visit(parsed.contenu);
    visit(parsed.editor);
    visit(parsed.canvas);
    visit(parsed.raw);
    visit(parsed.item);
    visit(parsed.result);
  };

  visit(root);
  return roots;
}

function hasRenderableDraft(mode: Mode, draft: any) {
  if (!draft || typeof draft !== "object") return false;
  if (mode === "post") return Array.isArray(draft.layers) && draft.layers.length > 0;
  if (!Array.isArray(draft.slides) || draft.slides.length === 0) return false;
  return draft.slides.some((slide: any) => Array.isArray(slide?.layers) && slide.layers.length > 0);
}

function dispatchEditorDraft(mode: Mode, draft: any) {
  if (typeof window === "undefined") return;
  try {
    (window as any).__LGD_EDITOR_PENDING_DRAFT__ = { mode, draft, ts: Date.now() };
  } catch {
    // no-op
  }

  const fire = () => {
    try {
      window.dispatchEvent(
        new CustomEvent(LGD_EDITOR_LOAD_DRAFT_EVENT, {
          detail: { mode, draft, ts: Date.now() },
        })
      );
    } catch {
      // no-op
    }
  };

  fire();
  window.setTimeout(fire, 80);
  window.setTimeout(fire, 250);
  window.setTimeout(fire, 700);
}

function extractArchivePostDraft(payloadLike: any) {
  const roots = unwrapSavedPayload(payloadLike);

  for (const payload of roots) {
    const layers = restoreArchivedLineBreaksInLayers(
      normalizeLayers(
        payload?.layers ||
          payload?.data?.layers ||
          payload?.canvas?.layers ||
          payload?.draft?.layers ||
          payload?.draft?.canvas?.layers ||
          payload?.content?.layers ||
          payload?.payload?.layers ||
          []
      )
    );

    const ui =
      payload?.ui ||
      payload?.data?.ui ||
      payload?.canvas?.ui ||
      payload?.draft?.ui ||
      payload?.draft?.canvas?.ui ||
      payload?.content?.ui ||
      payload?.payload?.ui ||
      {};

    if (layers.length) {
      return {
        ...payload,
        type: "post",
        ui,
        layers,
      };
    }
  }

  return { type: "post", layers: [], ui: {} };
}

function extractArchiveCarrouselDraft(payloadLike: any) {
  const roots = unwrapSavedPayload(payloadLike);

  for (const payload of roots) {
    const rawSlides = firstArray(
      payload?.slides,
      payload?.data?.slides,
      payload?.canvas?.slides,
      payload?.draft?.slides,
      payload?.content?.slides,
      payload?.payload?.slides,
      payload?.carrousel?.slides
    );

    const slides = rawSlides.map((slide: any, index: number) => ({
      ...slide,
      id: String(slide?.id || `slide-${index + 1}`),
      layers: restoreArchivedLineBreaksInLayers(extractSlideLayers(slide)),
    }));

    const ui =
      payload?.ui ||
      payload?.data?.ui ||
      payload?.canvas?.ui ||
      payload?.draft?.ui ||
      payload?.draft?.canvas?.ui ||
      payload?.content?.ui ||
      payload?.payload?.ui ||
      {};

    if (slides.some((s: any) => Array.isArray(s.layers) && s.layers.length)) {
      return {
        ...payload,
        type: "carrousel",
        ui,
        slides,
      };
    }
  }

  return { type: "carrousel", slides: [], ui: {} };
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
  const { schedule, loading: scheduleLoading } = useSchedulePlanner();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [plannerPreparing, setPlannerPreparing] = useState(false);
  const plannerPreparedRef = useRef<{ mode: Mode; draft: any; previewImage: string } | null>(null);
  const [brief, setBrief] = useState<string>("");
  const [cmoAutoMsg, setCmoAutoMsg] = useState<string>("");

  const [archiving, setArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState<string>("");

  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string>("");

  const [loadingArchiveSelection, setLoadingArchiveSelection] = useState(false);
  const [archiveSelectionError, setArchiveSelectionError] = useState("");
  const liveDraftRef = useRef<Record<Mode, any>>({ post: null, carrousel: null });

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
          liveDraftRef.current.post = draft;
          await safePersistEditorDraft(LS_POST, draft);
          setMode("post");
          dispatchEditorDraft("post", draft);
        } else {
          const draft = extractArchiveCarrouselDraft(payloadRaw);
          window.localStorage.setItem(LS_EDITOR_MODE, "carrousel");
          liveDraftRef.current.carrousel = draft;
          await safePersistEditorDraft(LS_CARROUSEL, draft);
          if (draft?.slides?.[0]?.id) {
            window.localStorage.setItem("lgd_editor_carrousel_active_slide_v5", String(draft.slides[0].id));
          }
          setMode("carrousel");
          dispatchEditorDraft("carrousel", draft);
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
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(LS_CMO_AUTO_PAYLOAD);
      if (!raw) return;

      const payload = JSON.parse(raw);
      const target = String(payload?.target || payload?.module || "").toLowerCase();
      if (target !== "editor") return;

      const cmoBrief = buildCmoEditorBrief(payload);
      const cmoMode = detectCmoEditorMode(payload);
      const cmoId = `cmo:${payload?.created_at || Date.now()}`;

      setMode(cmoMode);
      setBrief(cmoBrief);
      setCmoAutoMsg(
        cmoMode === "carrousel"
          ? "✨ Le CMO IA prépare ton carrousel dans l’éditeur intelligent…"
          : "✨ Le CMO IA prépare ton post dans l’éditeur intelligent…"
      );

      window.localStorage.setItem(LS_EDITOR_MODE, cmoMode);
      window.localStorage.setItem(LS_COACH_BRIEF, cmoBrief);
      window.localStorage.setItem(LS_BRIEF_LAST_CONSUMED, cmoId);
      window.localStorage.removeItem(LS_EDITOR_INTELLIGENT_BRIEF);
      window.localStorage.removeItem(LS_CMO_AUTO_PAYLOAD);

      try {
        const rawProgress = window.localStorage.getItem(LS_DASHBOARD_DAILY_PROGRESS);
        const parsed = rawProgress ? JSON.parse(rawProgress) : {};
        window.localStorage.setItem(
          LS_DASHBOARD_DAILY_PROGRESS,
          JSON.stringify({
            idea: Boolean(parsed?.idea),
            content: true,
            email: Boolean(parsed?.email),
            offer: Boolean(parsed?.offer),
          })
        );
      } catch {
        // ignore
      }

      window.setTimeout(() => setCmoAutoMsg(""), 4200);
    } catch (e) {
      console.error("CMO editor payload error", e);
      window.localStorage.removeItem(LS_CMO_AUTO_PAYLOAD);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("lgd_editor_mode", mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const key = mode === "post" ? LS_POST : LS_CARROUSEL;
    const storedRaw = safeJsonParse(window.localStorage.getItem(key));
    if (!isIndexedDbDraftMarker(storedRaw)) return;

    idbGetEditorDraft(key).then((draft) => {
      if (cancelled || !hasRenderableDraft(mode, draft)) return;
      liveDraftRef.current[mode] = draft;
      dispatchEditorDraft(mode, draft);
    });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => setIsPhone(window.innerWidth < 640);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const getDraftForMode = (targetMode: Mode) => {
    if (typeof window === "undefined") return null;

    const liveDraft = liveDraftRef.current?.[targetMode];
    if (hasRenderableDraft(targetMode, liveDraft)) return liveDraft;

    const key = targetMode === "post" ? LS_POST : LS_CARROUSEL;
    const storedRaw = safeJsonParse(window.localStorage.getItem(key));
    const storedDraft = isIndexedDbDraftMarker(storedRaw) ? null : storedRaw;
    if (hasRenderableDraft(targetMode, storedDraft)) return storedDraft;

    return storedDraft || liveDraft || null;
  };

  const getDraft = () => getDraftForMode(mode);

  const switchEditorMode = (nextMode: Mode) => {
    if (typeof window === "undefined") {
      setMode(nextMode);
      return;
    }

    if (nextMode === mode) return;

    const currentDraft = getDraftForMode(mode);
    if (hasRenderableDraft(mode, currentDraft)) {
      liveDraftRef.current[mode] = currentDraft;
      const currentKey = mode === "post" ? LS_POST : LS_CARROUSEL;
      void safePersistEditorDraft(currentKey, currentDraft);
    }

    const nextDraft = getDraftForMode(nextMode);
    if (hasRenderableDraft(nextMode, nextDraft)) {
      liveDraftRef.current[nextMode] = nextDraft;
      const nextKey = nextMode === "post" ? LS_POST : LS_CARROUSEL;
      try {
        window.localStorage.setItem(nextKey, JSON.stringify(nextDraft));
      } catch {
        void safePersistEditorDraft(nextKey, nextDraft);
      }
      (window as any).__LGD_EDITOR_PENDING_DRAFT__ = {
        mode: nextMode,
        draft: nextDraft,
        ts: Date.now(),
      };
    }

    setMode(nextMode);
  };

  const handlePostSnapshot = (snapshot: { ui?: any; layers: any[] }) => {
    const draft = {
      type: "post",
      ui: snapshot?.ui || {},
      layers: Array.isArray(snapshot?.layers) ? snapshot.layers : [],
    };

    if (hasRenderableDraft("post", draft)) {
      liveDraftRef.current.post = draft;
    }
  };

  const handleCarrouselSnapshot = (snapshot: { ui?: any; slides: any[] }) => {
    const draft = {
      type: "carrousel",
      ui: snapshot?.ui || {},
      slides: Array.isArray(snapshot?.slides) ? snapshot.slides : [],
    };

    if (hasRenderableDraft("carrousel", draft)) {
      liveDraftRef.current.carrousel = draft;
    }
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

  function getPlannerTitleFromDraft(draft: any) {
    const fallback = mode === "post" ? "Post intelligent LGD" : "Carrousel intelligent LGD";

    if (!draft || typeof draft !== "object") return fallback;

    const layers =
      mode === "post"
        ? Array.isArray(draft?.layers)
          ? draft.layers
          : []
        : Array.isArray(draft?.slides?.[0]?.layers)
          ? draft.slides[0].layers
          : [];

    const firstText = layers
      .map((layer: any) => String(layer?.text || layer?.content || layer?.value || "").trim())
      .find(Boolean);

    return (firstText || fallback).slice(0, 72);
  }

  async function openPlannerModal() {
    const draft = getDraft();
    if (!hasRenderableDraft(mode, draft)) {
      setArchiveMsg("❌ Aucun contenu à envoyer dans le Planner.");
      window.setTimeout(() => setArchiveMsg(""), 3000);
      return;
    }

    setPlannerPreparing(true);
    setArchiveMsg("Préparation du média Planner…");

    let previewImage = "";
    try {
      previewImage = await renderEditorCreationToDataUrl({
        mode,
        draft,
      });
    } catch (error) {
      console.error("LGD planner pre-render error (editor router):", error);
    }

    plannerPreparedRef.current = {
      mode,
      draft,
      previewImage: previewImage || "",
    };

    setPlannerPreparing(false);
    setArchiveMsg("");
    setScheduleOpen(true);
  }

  const handleScheduleConfirm = useCallback(
    async ({ reseau, date_programmee, titre }: { reseau: string; date_programmee: string; titre?: string }) => {
      const prepared = plannerPreparedRef.current;
      const preparedDraft =
        prepared?.mode === mode && hasRenderableDraft(mode, prepared?.draft)
          ? prepared.draft
          : null;

      // LGD FIX — le Planner doit utiliser le draft vivant préparé au clic header.
      // Ne pas recalculer depuis l'état courant ici : selon le timing React,
      // cela peut renvoyer un état compacté/vide et perdre les images/slides.
      const draft = preparedDraft || getDraft();

      if (!hasRenderableDraft(mode, draft)) {
        setArchiveMsg("❌ Aucun contenu à envoyer dans le Planner.");
        window.setTimeout(() => setArchiveMsg(""), 3000);
        return;
      }

      const plannerTitle = titre || getPlannerTitleFromDraft(draft);
      let previewImage = preparedDraft ? prepared?.previewImage || "" : "";

      if (!previewImage) {
        try {
          previewImage = await renderEditorCreationToDataUrl({
            mode,
            draft,
          });
        } catch (error) {
          console.error("LGD planner snapshot error (editor router):", error);
        }
      }

      await schedule({
        reseau,
        date_programmee,
        titre: plannerTitle,
        format: mode,
        contenu: {
          title: plannerTitle,
          type: mode,
          ...(mode === "post"
            ? {
                layers: Array.isArray(draft?.layers) ? draft.layers : [],
                ui: draft?.ui || {},
              }
            : {
                slides: Array.isArray(draft?.slides) ? draft.slides : [],
                ui: draft?.ui || {},
              }),
          brief: brief || "",
          preview_image: previewImage || undefined,
          planner_preview_image: previewImage || undefined,
          rendered_image: previewImage || undefined,
        },
      });

      plannerPreparedRef.current = null;

      setScheduleOpen(false);
      if (typeof window !== "undefined") window.alert("✅ Ajouté au Planner !");
    },
    [schedule, mode, brief]
  );

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
                onClick={openPlannerModal}
                disabled={scheduleLoading || plannerPreparing}
                className="rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-black/40 disabled:opacity-60"
                title="Envoyer la création actuelle dans le Planner"
              >
                {plannerPreparing ? "Préparation média…" : scheduleLoading ? "Envoi Planner…" : "📅 Envoyer dans Planner"}
              </button>

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

        {cmoAutoMsg ? (
          <div className="mx-auto mt-10 max-w-[980px] rounded-3xl border border-yellow-500/25 bg-yellow-500/10 px-6 py-4 text-center text-sm font-semibold text-yellow-100 shadow-[0_0_30px_rgba(255,184,0,0.10)]">
            {cmoAutoMsg}
          </div>
        ) : null}

        <h1 className="mt-20 text-center text-4xl font-extrabold text-[#ffb800]">L’Éditeur Intelligent + Copilote IA– {modeLabel}</h1>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => switchEditorMode("post")}
            className={`rounded-xl px-5 py-2 text-sm font-semibold ${
              mode === "post" ? "bg-[#ffb800] text-black" : "border border-yellow-500/25 bg-black/30 text-yellow-200"
            }`}
          >
            Mode POST
          </button>

          <button
            onClick={() => switchEditorMode("carrousel")}
            className={`rounded-xl px-5 py-2 text-sm font-semibold ${
              mode === "carrousel" ? "bg-[#ffb800] text-black" : "border border-yellow-500/25 bg-black/30 text-yellow-200"
            }`}
          >
            Mode CARROUSEL
          </button>
        </div>
      </div>

      <div className="mx-auto mt-1 w-full max-w-[1800px] px-6 pb-16">
        {mode === "post" ? (
          <PostEditor brief={brief} onSnapshot={handlePostSnapshot} />
        ) : (
          <CarrouselEditor brief={brief} onSnapshot={handleCarrouselSnapshot} />
        )}
      </div>

      <SchedulePlannerModal
        open={scheduleOpen}
        loading={scheduleLoading}
        defaultTitle={getPlannerTitleFromDraft(getDraft())}
        onClose={() => setScheduleOpen(false)}
        onConfirm={handleScheduleConfirm}
      />
    </div>
  );
}


