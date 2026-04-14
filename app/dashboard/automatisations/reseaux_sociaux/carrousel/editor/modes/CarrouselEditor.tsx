"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerData } from "../v5/types/layers";
import EditorLayout from "../v5/ui/EditorLayout";
import SchedulePlannerModal from "../ui/SchedulePlannerModal";
import useSchedulePlanner from "../v5/hooks/useSchedulePlanner";
import { renderSingleCreationToDataUrl } from "../utils/downloadEditorCreation";

interface Props {
  mobileToolsOpen?: boolean;
  onCloseMobileTools?: () => void;

  // ✅ Coach brief (Alex V2) — optional
  brief?: string;
}

const LS_CARROUSEL = "lgd_editor_carrousel_draft_v5";
const LS_CARROUSEL_ACTIVE_SLIDE = "lgd_editor_carrousel_active_slide_v5";

// Copilot toggle (persisted)
const LS_CARROUSEL_COPILOT_OPEN = "lgd_editor_carrousel_copilot_open_v5";

// Brief banner dismissed (per user)
const LS_BRIEF_DISMISSED = "lgd_editor_brief_dismissed";

type SlideDraft = {
  id: string;
  layers: LayerData[];
};

/** =========================
 *  IA Copilot (SAFE / texte-only)
 *  - utilise /ai/text/rewrite existant
 *  - ne touche PAS au moteur canvas
 *  - CARROUSEL : slide active uniquement
 *  ========================= */

type Network = "Instagram" | "TikTok" | "LinkedIn" | "Facebook";
type Objective = "Attirer" | "Éduquer" | "Convertir" | "Story";
type Angle =
  | "MRR débutant"
  | "Produit digital"
  | "Objection"
  | "Storytelling"
  | "Preuve"
  | "Tutoriel"
  | "Erreur fréquente"
  | "Mindset / discipline";

type CopilotTask = "hooks" | "slideText" | "steps" | "cta" | "rewrite";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function systemePlansUrl() {
  return (
    process.env.NEXT_PUBLIC_SYSTEME_PLANS_URL ||
    "https://legenerateurdigital.systeme.io/plans"
  ).trim();
}

function openPlans() {
  if (typeof window === "undefined") return;
  const url = systemePlansUrl();
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function isQuotaError(msg: string) {
  const m = (msg || "").toLowerCase();
  return m.includes("quota") || m.includes("plan") || m.includes("systeme");
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

function estimateTokens(text: string) {
  const t = (text || "").trim();
  if (!t) return 1;
  return Math.max(1, Math.ceil(t.length / 4));
}

async function consumeCoachQuota(amount: number) {
  const base = apiBase();
  if (!base) return;
  const a = Math.max(1, Math.trunc(Number(amount) || 1));
  const res = await fetch(`${base}/ai-quota/consume?amount=${a}&feature=coach`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.detail || j?.message || "";
    } catch {
      // ignore
    }

    if (res.status === 400) {
      throw new Error(detail || "Quota insuffisant. Veuillez changer de plan.");
    }

    throw new Error(detail || `Erreur IA-Quotas (HTTP ${res.status})`);
  }
}

async function aiRewriteText(args: { text: string; tone?: string; max_length?: number }) {
  const base = apiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL manquant");

  const res = await fetch(`${base}/ai/text/rewrite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({
      text: args.text,
      tone: args.tone || undefined,
      max_length: args.max_length && args.max_length > 0 ? args.max_length : undefined,
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
    throw new Error(detail || `IA indisponible (HTTP ${res.status})`);
  }

  const data = await res.json().catch(() => ({} as any));
  const out = data?.result ?? data?.text ?? data?.output ?? "";
  if (!out || typeof out !== "string") throw new Error("Réponse IA invalide");

  await consumeCoachQuota(estimateTokens(args.text) + estimateTokens(out));
  return out;
}

function safeJsonParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function stableSig(value: any) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return "";
  }
}

function stripNonSerializableUI(input: any): any {
  if (input == null) return input;
  const t = typeof input;
  if (t === "function") return undefined;
  if (t !== "object") return input;

  const anyObj: any = input as any;
  if (anyObj?.nodeType === 1 || anyObj?.tagName || anyObj?.nodeName) return undefined;

  if (Array.isArray(input)) {
    return input
      .map((x) => stripNonSerializableUI(x))
      .filter((x) => x !== undefined);
  }

  const out: any = {};
  for (const [k, v] of Object.entries(anyObj)) {
    if (v === undefined) continue;
    if (k === "runtime" || k === "_runtime" || k === "__runtime") continue;
    if (k === "konva" || k === "_konva" || k === "__konva") continue;
    if (k === "stage" || k === "layer" || k === "node" || k === "ref") continue;
    if (k === "imageElement" || k === "imgEl" || k === "htmlImage") continue;

    const cleaned = stripNonSerializableUI(v);
    if (cleaned !== undefined) out[k] = cleaned;
  }
  return out;
}

function stableSerialize(value: any): string {
  const seen = new WeakSet();

  const normalize = (input: any): any => {
    if (input == null || typeof input !== "object") return input;
    if (seen.has(input)) return undefined;
    seen.add(input);

    if (Array.isArray(input)) return input.map(normalize);

    const out: Record<string, any> = {};
    for (const key of Object.keys(input).sort()) {
      const normalized = normalize(input[key]);
      if (normalized !== undefined) out[key] = normalized;
    }
    return out;
  };

  try {
    return JSON.stringify(normalize(value));
  } catch {
    return String(value);
  }
}

function layersSignature(layers: LayerData[] | null | undefined) {
  return stableSerialize(
    (layers || []).map((l: any) => ({
      id: l?.id,
      type: l?.type,
      src: typeof l?.src === "string" ? l.src : undefined,
      text: typeof l?.text === "string" ? l.text : undefined,
      x: l?.x,
      y: l?.y,
      width: l?.width,
      height: l?.height,
      zIndex: l?.zIndex,
      visible: l?.visible,
      style: l?.style,
    }))
  );
}

function clip(s: string, n = 46) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

function cryptoId(prefix = "id") {
  const r = Math.random().toString(16).slice(2);
  return `${prefix}-${Date.now()}-${r}`;
}

function ensureSlide(slides: SlideDraft[] | null | undefined): SlideDraft[] {
  if (slides && Array.isArray(slides) && slides.length > 0) return slides;
  return [{ id: cryptoId("slide"), layers: [] }];
}

function extractTextFromLayers(layers: LayerData[]) {
  return (layers || [])
    .filter((l: any) => l?.type === "text")
    .map((l: any) => String(l?.text ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

function normalizeBriefSig(b: string) {
  return (b || "").replace(/\s+/g, " ").trim();
}

function inferObjectiveFromBrief(brief: string): Objective {
  const b = (brief || "").toLowerCase();

  if (
    /\b(vendre|vente|acheter|commande|panier|promo|promotion|offre|prix|tarif|inscription|inscris|réserve|rdv|appel|dm|message)\b/.test(b) ||
    /\b(convert|conversion|closing|close)\b/.test(b)
  ) {
    return "Convertir";
  }

  if (/\b(tuto|tutoriel|comment|étapes|etapes|guide|méthode|checklist|process|processus)\b/.test(b)) {
    return "Éduquer";
  }

  if (/\b(story|histoire|parcours|avant\s*\/\s*après|avant-après|avant apres|mon expérience|mon experience)\b/.test(b)) {
    return "Story";
  }

  return "Attirer";
}

function inferAngleFromBrief(brief: string): Angle {
  const b = (brief || "").toLowerCase();

  if (/\b(trop\s*cher|pas\s*le\s*temps|je\s*(pense|crois)|peur|objection|bloqué|bloque|doute)\b/.test(b)) {
    return "Objection";
  }
  if (/\b(preuve|résultat|resultat|chiffre|cas\s*client|témoignage|temoignage|avant\s*\/\s*après|avant-après)\b/.test(b)) {
    return "Preuve";
  }
  if (/\b(tuto|tutoriel|étapes|etapes|checklist|process|processus)\b/.test(b)) {
    return "Tutoriel";
  }
  if (/\b(story|histoire|parcours)\b/.test(b)) {
    return "Storytelling";
  }
  if (/\b(erreur|à\s*éviter|a\s*eviter|ne\s*fait\s*pas|stop|piège|piege)\b/.test(b)) {
    return "Erreur fréquente";
  }
  if (/\b(mindset|discipline|habitude|routine|procrast|procrastination|motivation)\b/.test(b)) {
    return "Mindset / discipline";
  }

  if (/\bmrr\b/.test(b)) return "MRR débutant";
  return "Produit digital";
}

export default function CarrouselEditor({ mobileToolsOpen, onCloseMobileTools, brief }: Props) {
  const [slides, setSlides] = useState<SlideDraft[]>(() => {
    const parsed = safeJsonParse(typeof window !== "undefined" ? window.localStorage.getItem(LS_CARROUSEL) : null);

    if (parsed?.slides && Array.isArray(parsed.slides)) {
      return ensureSlide(parsed.slides);
    }

    if (parsed?.layers && Array.isArray(parsed.layers)) {
      return ensureSlide([{ id: cryptoId("slide"), layers: parsed.layers }]);
    }

    return ensureSlide(null);
  });

  const [draftUI, setDraftUI] = useState<any>(() => {
    const parsed = safeJsonParse(typeof window !== "undefined" ? window.localStorage.getItem(LS_CARROUSEL) : null);
    return parsed?.ui || undefined;
  });

  const uiRef = useRef<any>(draftUI);
  const lastUiSigRef = useRef<string>(stableSig(draftUI ?? {}));
  const lastLayersSigRef = useRef<string>("");
  const [editorRefreshKey, setEditorRefreshKey] = useState<number>(0);

  const [activeSlideId, setActiveSlideId] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(LS_CARROUSEL_ACTIVE_SLIDE) : null;
    return saved || "";
  });

  const activeSlideIdRef = useRef<string>("");
  useEffect(() => {
    activeSlideIdRef.current = activeSlideId;
  }, [activeSlideId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeSlideId) window.localStorage.setItem(LS_CARROUSEL_ACTIVE_SLIDE, activeSlideId);
  }, [activeSlideId]);

  useEffect(() => {
    if (!slides.length) return;
    if (!activeSlideId) {
      setActiveSlideId(slides[0].id);
      return;
    }
    const exists = slides.some((s) => s.id === activeSlideId);
    if (!exists) setActiveSlideId(slides[0].id);
  }, [slides, activeSlideId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const existing = safeJsonParse(window.localStorage.getItem(LS_CARROUSEL)) || {};
      window.localStorage.setItem(
        LS_CARROUSEL,
        JSON.stringify({
          ...existing,
          ui: uiRef.current ?? draftUI,
          slides,
        })
      );
    } catch {
      // no-op
    }
  }, [slides, draftUI]);

  const activeSlide = useMemo(() => slides.find((s) => s.id === activeSlideId) || slides[0], [slides, activeSlideId]);
  const activeSlideLayersSig = useMemo(() => layersSignature(activeSlide?.layers ?? []), [activeSlide?.layers]);

  useEffect(() => {
    setEditorRefreshKey((v) => v + 1);
  }, [activeSlideId]);

  const updateLayersForSlide = useCallback((slideId: string, layers: LayerData[]) => {
    const nextSig = layersSignature(layers ?? []);
    lastLayersSigRef.current = nextSig;

    setSlides((prev) => {
      let changed = false;
      const next = prev.map((s) => {
        if (s.id !== slideId) return s;
        if (layersSignature(s.layers) === nextSig) return s;
        changed = true;
        return { ...s, layers: layers ?? [] };
      });
      return changed ? next : prev;
    });
  }, []);

  const updateLayers = useCallback((layers: LayerData[]) => {
    const targetId = activeSlideIdRef.current;
    if (!targetId) return;
    updateLayersForSlide(targetId, layers ?? []);
  }, [updateLayersForSlide]);

  const handleUIChange = useCallback((ui: any) => {
    const cleaned = stripNonSerializableUI(ui ?? {});
    const sig = stableSig(cleaned ?? {});
    if (sig === lastUiSigRef.current) return;
    lastUiSigRef.current = sig;
    uiRef.current = cleaned;
    setDraftUI((prev: any) => (stableSig(prev ?? {}) === sig ? prev : cleaned));
  }, []);

  const addSlide = useCallback(() => {
    const id = cryptoId("slide");
    setSlides((prev) => [...prev, { id, layers: [] }]);
    setActiveSlideId(id);
  }, []);

  const duplicateActiveSlide = useCallback(() => {
    const id = cryptoId("slide");
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === activeSlide.id);
      const clone: SlideDraft = {
        id,
        layers: JSON.parse(JSON.stringify(activeSlide.layers || [])),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    setActiveSlideId(id);
  }, [activeSlide.id, activeSlide.layers]);

  const deleteActiveSlide = useCallback(() => {
    setSlides((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((s) => s.id === activeSlide.id);
      const next = prev.filter((s) => s.id !== activeSlide.id);
      const fallback = next[Math.max(0, idx - 1)]?.id || next[0]?.id;
      setActiveSlideId(fallback);
      return next;
    });
  }, [activeSlide.id]);

  const textLayers = useMemo(() => {
    return (activeSlide?.layers ?? []).filter((l: any) => l?.type === "text");
  }, [activeSlide?.layers]);

  const defaultTargetId = useMemo(() => {
    const anyText = textLayers as any[];
    const byMain = anyText.find((l) => String(l?.id || "").includes("text-main"));
    return (byMain?.id ?? anyText[0]?.id ?? "") as string;
  }, [textLayers]);

  const [targetLayerId, setTargetLayerId] = useState<string>("");
  useEffect(() => {
    setTargetLayerId(defaultTargetId || "");
  }, [activeSlideId, defaultTargetId]);

  const syncEditorSelection = useCallback((id: string) => {
    if (!id) return;
    const currentUI = uiRef.current ?? {};

    const currentSelectedLayerId = String(currentUI?.selectedLayerId ?? "");
    const currentSelectedId = String(currentUI?.selectedId ?? "");
    const currentSelectionId = String(currentUI?.selection?.id ?? "");
    const currentSelectedLayerIds = Array.isArray(currentUI?.selectedLayerIds)
      ? currentUI.selectedLayerIds.map((x: any) => String(x))
      : [];
    const currentSelectedIds = Array.isArray(currentUI?.selectedIds)
      ? currentUI.selectedIds.map((x: any) => String(x))
      : [];

    const alreadySelected =
      currentSelectedLayerId === String(id) &&
      currentSelectedId === String(id) &&
      currentSelectionId === String(id) &&
      currentSelectedLayerIds.length === 1 &&
      currentSelectedLayerIds[0] === String(id) &&
      currentSelectedIds.length === 1 &&
      currentSelectedIds[0] === String(id);

    if (alreadySelected) return;

    const nextUI = {
      ...currentUI,
      selectedLayerId: id,
      selectedId: id,
      selectedLayerIds: [id],
      selectedIds: [id],
      selection: {
        ...(currentUI?.selection || {}),
        id,
        ids: [id],
      },
    };

    handleUIChange(nextUI);
  }, [handleUIChange]);

  useEffect(() => {
    if (targetLayerId) syncEditorSelection(targetLayerId);
  }, [targetLayerId, syncEditorSelection]);

  const [idea, setIdea] = useState<string>("");
  const [network, setNetwork] = useState<Network>("Instagram");
  const [objective, setObjective] = useState<Objective>("Convertir");
  const [angle, setAngle] = useState<Angle>("MRR débutant");
  const [tone, setTone] = useState<string>("coach direct, clair, concret, orienté résultats");
  const [maxChars, setMaxChars] = useState<number>(0);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [aiOutput, setAiOutput] = useState<string>("");
  const [aiHooks, setAiHooks] = useState<string[]>([]);
  const { schedule, loading: scheduleLoading } = useSchedulePlanner();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const userTouchedIdeaRef = useRef(false);
  const userTouchedObjectiveRef = useRef(false);
  const userTouchedAngleRef = useRef(false);
  const lastInjectedBriefSigRef = useRef<string>("");

  const [briefDismissed, setBriefDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(LS_BRIEF_DISMISSED) === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LS_BRIEF_DISMISSED, briefDismissed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [briefDismissed]);

  const targetLayer = useMemo(() => {
    return (activeSlide?.layers ?? []).find((l: any) => String(l?.id) === String(targetLayerId)) as any;
  }, [activeSlide?.layers, targetLayerId]);

  const applyToLayer = useCallback(
    (text: string) => {
      if (!text) return;
      const id = targetLayerId || defaultTargetId;
      const slideId = activeSlideIdRef.current || activeSlideId;
      if (!id || !slideId) return;

      const layers = (slides.find((s) => s.id === slideId)?.layers ?? activeSlide?.layers ?? []) as LayerData[];
      if (!layers.length) return;

      const next = layers.map((l: any) => {
        if (String(l?.id) !== String(id)) return l;
        if (l?.type !== "text") return l;
        return { ...l, text };
      });

      updateLayersForSlide(slideId, next as any);
      syncEditorSelection(id);
      setEditorRefreshKey((v) => v + 1);
    },
    [slides, activeSlide?.layers, activeSlideId, targetLayerId, defaultTargetId, updateLayersForSlide, syncEditorSelection]
  );

  function buildContext() {
    const base = [
      "Tu es LGD Copilot : spécialiste du marketing digital, produits digitaux, formation, MRR (Master Resell Rights).",
      "Tu écris pour fédérer sur les réseaux sociaux et convertir vers une offre MRR / formation.",
      "Tu restes concret : bénéfices, preuve, structure claire, CTA.",
      "Français naturel, humain, impactant, crédible.",
      `Réseau: ${network}. Objectif: ${objective}. Angle: ${angle}.`,
      "Contraintes: CARROUSEL — une seule slide, texte court et lisible.",
    ].join("\n");

    const b = (brief || "").trim();
    if (!b) return base;
    return [base, "---", "Brief du coach (à respecter):", b].join("\n");
  }

  async function runCopilot(task: CopilotTask) {
    setAiError(null);
    setAiLoading(true);

    try {
      const slideText = extractTextFromLayers(activeSlide?.layers ?? []);
      const topic = (idea || "").trim() || slideText || "marketing digital / produits digitaux / MRR";

      const ctx = buildContext();
      let prompt = "";

      if (task === "hooks") {
        prompt = [
          ctx,
          "Génère 10 hooks ultra courts et accrocheurs pour une SLIDE de carrousel.",
          "Format STRICT : une liste numérotée 1 à 10, une seule ligne par hook. Pas d'explication.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "slideText") {
        prompt = [
          ctx,
          "Écris le texte complet d'UNE slide (titre + 2-4 lignes max).",
          "Style : lisible, punchy, humain, orienté valeur + MRR.",
          "Format STRICT :\nTITRE: ...\nTEXTE: ...",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "steps") {
        prompt = [
          ctx,
          "Écris une slide '3 étapes' (format carrousel).",
          "Format STRICT :\nTITRE: ...\n1) ...\n2) ...\n3) ...\nCTA: ...",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "cta") {
        prompt = [
          ctx,
          "Propose 5 CTA adaptés à une slide de carrousel (DM mot-clé / commentaire mot-clé / lien bio).",
          "Format STRICT : une liste à puces, 1 CTA par ligne. Pas d'explication.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else {
        const currentText = String((targetLayer as any)?.text ?? "").trim();
        prompt = [
          ctx,
          "Réécris et améliore ce texte pour le rendre plus clair, plus humain, plus persuasif et orienté MRR.",
          "Ne renvoie QUE le texte final.",
          `TEXTE:\n${currentText || topic}`,
        ].join("\n");
      }

      const out = await aiRewriteText({
        text: prompt,
        tone: tone?.trim() ? tone.trim() : undefined,
        max_length: maxChars > 0 ? maxChars : undefined,
      });

      if (task === "hooks") {
        const lines = out
          .split(/\r?\n/)
          .map((l) => l.replace(/^\s*\d+[\.)-]\s*/, "").trim())
          .filter(Boolean);

        setAiHooks(lines.slice(0, 10));
        setAiOutput(out);
      } else {
        setAiHooks([]);
        setAiOutput(out);
      }
    } catch (e: any) {
      setAiError(e?.message || "Erreur IA");
    } finally {
      setAiLoading(false);
    }
  }

  const [copilotOpen, setCopilotOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = window.localStorage.getItem(LS_CARROUSEL_COPILOT_OPEN);
    if (v === "0") return false;
    if (v === "1") return true;
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_CARROUSEL_COPILOT_OPEN, copilotOpen ? "1" : "0");
  }, [copilotOpen]);

  const copilotDisabled = !apiBase();

  useEffect(() => {
    const b = (brief || "").trim();
    if (!b) return;

    const sig = normalizeBriefSig(b);

    if (!userTouchedIdeaRef.current) {
      setIdea((prev) => (prev && prev.trim().length > 0 ? prev : b));
    }

    if (!userTouchedObjectiveRef.current) {
      const inferredObj = inferObjectiveFromBrief(b);
      setObjective((prev) => (userTouchedObjectiveRef.current ? prev : inferredObj));
    }

    if (!userTouchedAngleRef.current) {
      const inferredAngle = inferAngleFromBrief(b);
      setAngle((prev) => (userTouchedAngleRef.current ? prev : inferredAngle));
    }

    if (copilotDisabled) return;
    if (aiLoading) return;

    if (lastInjectedBriefSigRef.current === sig) return;

    if (aiOutput && aiOutput.trim().length > 0) {
      lastInjectedBriefSigRef.current = sig;
      return;
    }

    lastInjectedBriefSigRef.current = sig;

    setTimeout(() => {
      runCopilot("slideText").catch(() => {});
    }, 0);
  }, [brief]); // eslint-disable-line react-hooks/exhaustive-deps

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<string>("");

  const lastAuditSigRef = useRef<string>("");

  const computeSlideText = useCallback(() => {
    const layers = activeSlide?.layers ?? [];
    const parts = layers
      .filter((l: any) => l?.type === "text")
      .map((l: any) => String(l?.text ?? "").trim())
      .filter(Boolean);
    return parts.join("\n");
  }, [activeSlide?.layers]);

  const buildAuditPrompt = useCallback(() => {
    const slideText = computeSlideText();
    const ctx = [
      "Tu es LGD Audit IA : expert marketing digital, copywriting, psychologie de l'attention, conversion MRR (Master Resell Rights).",
      "Tu analyses une SEULE slide de carrousel (Instagram) : lisibilité, clarté, engagement, persuasion, cohérence MRR.",
      "Tu ne modifies pas le texte : lecture seule. Tu donnes un diagnostic + correctifs actionnables.",
      "Format STRICT:",
      "SCORE: <0-100>",
      "FORCES: - ... (3 max)",
      "FAIBLESSES: - ... (3 max)",
      "CORRECTIFS: - ... (5 max, concrets)",
      "VERSION PROPOSÉE (optionnelle): <une version améliorée très courte, si pertinent>",
      "---",
      `Slide (texte):\n${slideText || "(aucun texte détecté)"}`,
    ].join("\n");
    return ctx;
  }, [computeSlideText]);

  const runAudit = useCallback(async () => {
    setAuditError(null);
    setAuditLoading(true);

    try {
      const prompt = buildAuditPrompt();
      const sig = JSON.stringify({ prompt });
      if (sig === lastAuditSigRef.current && auditResult) {
        setAuditLoading(false);
        return;
      }
      lastAuditSigRef.current = sig;

      const out = await aiRewriteText({
        text: prompt,
        tone: "audit expert, franc, actionnable",
        max_length: 0,
      });

      setAuditResult(out);
    } catch (e: any) {
      setAuditError(e?.message || "Erreur Audit IA");
    } finally {
      setAuditLoading(false);
    }
  }, [buildAuditPrompt, auditResult]);

  const clearAudit = useCallback(() => {
    setAuditResult("");
    setAuditError(null);
    lastAuditSigRef.current = "";
  }, []);

  const plannerTitle = useMemo(() => {
    const slideTexts = slides
      .flatMap((slide) => (slide.layers || []).map((layer: any) => String(layer?.text || "").trim()).filter(Boolean));
    return clip(slideTexts[0] || idea || brief || "Carrousel intelligent LGD", 72);
  }, [slides, idea, brief]);

  const handleScheduleConfirm = useCallback(
    async ({ reseau, date_programmee, titre }: { reseau: string; date_programmee: string; titre?: string }) => {
      let previewImage = "";

      try {
        const firstSlide = slides[0];
        if (firstSlide?.layers?.length) {
          previewImage = await renderSingleCreationToDataUrl({
            layers: firstSlide.layers,
            ui: draftUI,
          });
        }
      } catch (error) {
        console.error("LGD planner snapshot carrousel error:", error);
      }

      await schedule({
        reseau,
        date_programmee,
        titre: titre || plannerTitle,
        format: "carrousel",
        slides: slides.map((slide) => ({ id: slide.id, layers: slide.layers })),
        contenu: {
          title: titre || plannerTitle,
          type: "carrousel",
          slides: slides.map((slide) => ({ id: slide.id, layers: slide.layers })),
          ui: draftUI,
          brief: brief || "",
          preview_image: previewImage || null,
          planner_preview_image: previewImage || null,
        },
      });
      setScheduleOpen(false);
      if (typeof window !== "undefined") window.alert("✅ Ajouté au Planner !");
    },
    [schedule, plannerTitle, slides, draftUI, brief]
  );

  return (
    <div className="w-full flex justify-center">
      <div className="mx-auto mt-20 w-full max-w-[1800px] px-6 pb-16">
        <div
          className="rounded-3xl p-8"
          style={{
            backgroundColor: "#262626",
            border: "1px solid rgba(255,184,0,0.25)",
          }}
        >
          <div className="w-full">
            {!briefDismissed && (brief || "").trim() ? (
              <div className="mb-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-yellow-200 font-semibold">Brief reçu du Coach Alex V2</div>
                    <div className="mt-1 text-sm text-yellow-100/80 whitespace-pre-wrap">{(brief || "").trim()}</div>
                    <div className="mt-2 text-[11px] text-white/55">
                      ✅ Injecté automatiquement dans le Copilot (Sujet + Objectif + Angle + 1ère génération).
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBriefDismissed(true)}
                    className="shrink-0 rounded-xl border border-yellow-500/25 bg-black/30 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-black/45"
                  >
                    Ignorer
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mb-5 rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-yellow-200 font-semibold">Audit IA — Slide active</div>
                  <div className="text-white/50 text-sm">
                    Lecture seule (ne modifie rien) • Score + forces/faiblesses + correctifs actionnables (MRR).
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runAudit}
                    disabled={auditLoading || copilotDisabled}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                  >
                    {auditLoading ? "Analyse…" : "🔎 Lancer l’audit"}
                  </button>
                  <button
                    onClick={clearAudit}
                    className="rounded-xl px-3 py-2 text-sm text-yellow-100 border border-yellow-500/20 bg-black/40 hover:bg-black/60"
                  >
                    Effacer
                  </button>
                </div>
              </div>

              {copilotDisabled ? (
                <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 text-sm">
                  NEXT_PUBLIC_API_URL manquant côté frontend.
                </div>
              ) : null}

              {auditError ? (
                <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 text-sm">
                  {auditError}
                </div>
              ) : null}

              {auditResult ? (
                <textarea
                  value={auditResult}
                  readOnly
                  rows={6}
                  className="mt-3 w-full rounded-2xl bg-black/40 border border-yellow-500/15 px-4 py-3 text-yellow-100 outline-none"
                />
              ) : (
                <div className="mt-3 text-[12px] text-white/45">
                  Texte détecté sur la slide active : {computeSlideText() ? "oui" : "non"}.
                </div>
              )}
            </div>

            <div className="mb-6 rounded-3xl border border-yellow-500/15 bg-black/30">
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="text-yellow-200 font-semibold">Copilot IA — Carrousel (Marketing digital • MRR)</div>
                  <div className="text-white/55 text-sm">Slide active uniquement • texte-only • hooks/valeur/CTA (safe)</div>
                </div>

                <button
                  onClick={() => setCopilotOpen((v) => !v)}
                  className="rounded-xl border border-yellow-500/25 bg-black/40 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-black/55"
                >
                  {copilotOpen ? "Masquer" : "Afficher"}
                </button>
              </div>

              {copilotOpen ? (
                <div className="px-5 pb-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => runCopilot("hooks")}
                      disabled={aiLoading || copilotDisabled}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                    >
                      Hooks x10
                    </button>
                    <button
                      onClick={() => runCopilot("slideText")}
                      disabled={aiLoading || copilotDisabled}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                    >
                      Texte slide
                    </button>
                    <button
                      onClick={() => runCopilot("steps")}
                      disabled={aiLoading || copilotDisabled}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                    >
                      3 étapes
                    </button>
                    <button
                      onClick={() => runCopilot("cta")}
                      disabled={aiLoading || copilotDisabled}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                    >
                      CTA
                    </button>
                    <button
                      onClick={() => runCopilot("rewrite")}
                      disabled={aiLoading || copilotDisabled || !targetLayerId}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                    >
                      Réécrire
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4">
                      <label className="block text-yellow-300 text-xs mb-2">Sujet / idée (optionnel)</label>
                      <input
                        value={idea}
                        onChange={(e) => {
                          userTouchedIdeaRef.current = true;
                          setIdea(e.target.value);
                        }}
                        placeholder="Ex : 3 erreurs MRR qui te bloquent…"
                        className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                      />

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-yellow-300 text-xs mb-2">Réseau</label>
                          <select
                            value={network}
                            onChange={(e) => setNetwork(e.target.value as Network)}
                            className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                          >
                            <option>Instagram</option>
                            <option>TikTok</option>
                            <option>LinkedIn</option>
                            <option>Facebook</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-yellow-300 text-xs mb-2">Objectif</label>
                          <select
                            value={objective}
                            onChange={(e) => {
                              userTouchedObjectiveRef.current = true;
                              setObjective(e.target.value as Objective);
                            }}
                            className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                          >
                            <option>Attirer</option>
                            <option>Éduquer</option>
                            <option>Convertir</option>
                            <option>Story</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-yellow-300 text-xs mb-2">Angle</label>
                          <select
                            value={angle}
                            onChange={(e) => {
                              userTouchedAngleRef.current = true;
                              setAngle(e.target.value as Angle);
                            }}
                            className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                          >
                            <option>MRR débutant</option>
                            <option>Produit digital</option>
                            <option>Objection</option>
                            <option>Storytelling</option>
                            <option>Preuve</option>
                            <option>Tutoriel</option>
                            <option>Erreur fréquente</option>
                            <option>Mindset / discipline</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-yellow-300 text-xs mb-2">Longueur max (caractères)</label>
                          <input
                            type="number"
                            min={0}
                            value={maxChars}
                            onChange={(e) => setMaxChars(Number(e.target.value || 0))}
                            className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                          />
                          <div className="mt-1 text-[11px] text-white/45">0 = auto • approx. caractères</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-yellow-300 text-xs mb-2">Ton / Style (LGD)</label>
                        <input
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="block text-yellow-300 text-xs mb-2">Appliquer sur le layer texte (slide active)</label>
                        <select
                          value={targetLayerId}
                          onChange={(e) => setTargetLayerId(e.target.value)}
                          className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 px-4 py-3 text-yellow-100 outline-none"
                        >
                          {textLayers.length === 0 ? <option value="">Aucun layer texte</option> : null}
                          {textLayers.map((l: any) => (
                            <option key={String(l.id)} value={String(l.id)}>
                              {String(l.id)} — “{clip(String(l.text || ""))}”
                            </option>
                          ))}
                        </select>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => syncEditorSelection(targetLayerId || defaultTargetId)}
                            disabled={!targetLayerId && !defaultTargetId}
                            className="rounded-xl px-3 py-2 text-xs text-yellow-100 border border-yellow-500/20 bg-black/40 hover:bg-black/60 disabled:opacity-60"
                          >
                            Sélectionner ce layer dans l’éditeur
                          </button>
                          <div className="text-[11px] text-white/45">La cible texte reste synchronisée avec la slide active.</div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-8">
                      <div className="rounded-3xl p-4 bg-black/30 border border-yellow-500/15">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-yellow-200 font-semibold">Résultat IA</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => applyToLayer(aiOutput)}
                              disabled={aiLoading || !aiOutput || textLayers.length === 0}
                              className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                            >
                              Appliquer au layer
                            </button>
                            <button
                              onClick={() => {
                                setAiOutput("");
                                setAiHooks([]);
                                setAiError(null);
                              }}
                              className="rounded-xl px-3 py-2 text-sm text-yellow-100 border border-yellow-500/20 bg-black/40 hover:bg-black/60"
                            >
                              Effacer
                            </button>
                          </div>
                        </div>

                        {aiError ? (
                          <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>{aiError}</div>
                              {isQuotaError(aiError) ? (
                                <button
                                  type="button"
                                  onClick={openPlans}
                                  className="shrink-0 rounded-xl border border-yellow-500/25 bg-black/35 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-black/50"
                                >
                                  Voir les plans
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        {aiLoading ? (
                          <div className="mt-3 rounded-2xl border border-yellow-500/15 bg-black/25 px-4 py-8">
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                              <div className="text-sm text-white/70">Génération IA en cours...</div>
                              <div className="text-xs text-white/45 text-center">
                                LGD prépare une proposition premium à injecter dans ton carrousel.
                              </div>
                            </div>
                          </div>
                        ) : aiHooks.length > 0 ? (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {aiHooks.map((h, idx) => (
                              <button
                                key={`${idx}-${h}`}
                                onClick={() => {
                                  setAiOutput(h);
                                  applyToLayer(h);
                                }}
                                className="text-left rounded-2xl border border-yellow-500/15 bg-black/40 hover:bg-black/55 px-4 py-3 text-yellow-100"
                              >
                                <div className="text-[11px] text-white/45 mb-1">Suggestion {idx + 1}</div>
                                <div className="text-sm font-semibold">{h}</div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={aiOutput}
                            onChange={(e) => setAiOutput(e.target.value)}
                            placeholder="Les résultats IA apparaîtront ici…"
                            rows={8}
                            className="mt-3 w-full rounded-2xl bg-black/40 border border-yellow-500/15 px-4 py-3 text-yellow-100 outline-none"
                          />
                        )}

                        {targetLayer ? (
                          <div className="mt-3 text-[11px] text-white/45">
                            Layer cible : <span className="text-yellow-200">{String((targetLayer as any)?.id || "")}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                disabled={scheduleLoading}
                className="rounded-xl border border-yellow-500/25 bg-[#ffb800] px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
              >
                {scheduleLoading ? "Planification" : "Planifier"}
              </button>
            </div>

            <EditorLayout
              key={`${activeSlideId}-${editorRefreshKey}`}
              initialLayers={activeSlide?.layers ?? []}
              initialLayersKey={`${activeSlideId}-${editorRefreshKey}`}
              initialUI={draftUI}
              onUIChange={handleUIChange}
              onChange={updateLayers}
              mobileToolsOpen={mobileToolsOpen}
              onCloseMobileTools={onCloseMobileTools}
            />

            <SchedulePlannerModal
              open={scheduleOpen}
              loading={scheduleLoading}
              defaultTitle={plannerTitle}
              onClose={() => setScheduleOpen(false)}
              onConfirm={handleScheduleConfirm}
            />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {slides.map((s, idx) => {
                const active = s.id === activeSlideId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSlideId(s.id)}
                    className={[
                      "px-4 py-2 rounded-xl border text-sm",
                      active
                        ? "bg-[#ffb800] text-black border-[#ffb800]"
                        : "bg-black/40 text-yellow-100 border-yellow-500/20 hover:bg-black/55",
                    ].join(" ")}
                  >
                    Slide {idx + 1}
                  </button>
                );
              })}

              <button
                onClick={addSlide}
                className="px-4 py-2 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/15"
              >
                + Ajouter
              </button>

              <button
                onClick={duplicateActiveSlide}
                className="px-4 py-2 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/15"
              >
                Dupliquer
              </button>

              <button
                onClick={deleteActiveSlide}
                className="px-4 py-2 rounded-xl border border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/15"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
