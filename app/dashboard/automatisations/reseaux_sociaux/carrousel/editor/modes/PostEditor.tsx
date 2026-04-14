"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerData } from "../v5/types/layers";
import EditorLayout from "../v5/ui/EditorLayout";
import { renderEditorCreationToDataUrl } from "../utils/downloadEditorCreation";
import SchedulePlannerModal from "../ui/SchedulePlannerModal";
import useSchedulePlanner from "../v5/hooks/useSchedulePlanner";

interface Props {
  mobileToolsOpen?: boolean;
  onCloseMobileTools?: () => void;

  // ✅ Coach brief (Alex V2) — optional
  brief?: string;

  // ✅ sauvegarde locale / dirty
  onDirtyChange?: (dirty: boolean) => void;
  onSnapshot?: (snapshot: { ui?: any; layers: LayerData[] }) => void;
}

const LS_POST = "lgd_editor_post_draft_v5";
const LS_COPILOT_OPEN = "lgd_editor_copilot_open";

// Brief banner dismissed (per user)
const LS_BRIEF_DISMISSED = "lgd_editor_brief_dismissed";

/** =========================
 *  IA Copilot (SAFE / texte-only)
 *  - utilise /ai/text/rewrite existant
 *  - ne touche PAS au moteur canvas
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
  // estimation très simple (≈ 1 token ~ 4 caractères)
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

  // IMPORTANT : on consomme AVANT de livrer.
  // Si quota dépassé (400), on stoppe et l'UI affiche l'erreur (pas de livraison gratuite).
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

/**
 * ✅ MICRO PATCH anti-loop
 * On nettoie l'UI qui remonte de l'éditeur (runtime/konva/dom refs)
 * pour éviter un "ui" différent à chaque render => setState loop.
 */
function stripNonSerializableUI(input: any): any {
  if (input == null) return input;
  const t = typeof input;
  if (t === "function") return undefined;
  if (t !== "object") return input;

  // DOM nodes
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

    // drop common runtime keys
    if (k === "runtime" || k === "_runtime" || k === "__runtime") continue;
    if (k === "konva" || k === "_konva" || k === "__konva") continue;
    if (k === "stage" || k === "layer" || k === "node" || k === "ref") continue;
    if (k === "imageElement" || k === "imgEl" || k === "htmlImage") continue;

    const cleaned = stripNonSerializableUI(v);
    if (cleaned !== undefined) out[k] = cleaned;
  }
  return out;
}

function clip(s: string, n = 42) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

/** =========================
 *  Coach → Copilot (non-destructif)
 *  - inférences locales, zéro backend
 *  - n'écrase jamais si l'utilisateur a déjà modifié
 *  ========================= */
function normalizeBriefSig(b: string) {
  return (b || "").replace(/\s+/g, " ").trim();
}

function inferObjectiveFromBrief(brief: string): Objective {
  const b = (brief || "").toLowerCase();

  // Convertir (vente / DM / inscription / offre)
  if (
    /\b(vendre|vente|acheter|commande|panier|promo|promotion|offre|prix|tarif|inscription|inscris|réserve|rdv|appel|dm|message)\b/.test(b) ||
    /\b(convert|conversion|closing|close)\b/.test(b)
  ) {
    return "Convertir";
  }

  // Éduquer (tuto / étapes / guide)
  if (/\b(tuto|tutoriel|comment|étapes|etapes|guide|méthode|checklist|process|processus)\b/.test(b)) {
    return "Éduquer";
  }

  // Story (histoire / parcours / avant-après)
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

export default function PostEditor({
  mobileToolsOpen,
  onCloseMobileTools,
  onDirtyChange,
  onSnapshot,
  brief,
}: Props) {
  const [draftLayers, setDraftLayers] = useState<LayerData[] | undefined>(undefined);
  const [draftUI, setDraftUI] = useState<any>(undefined);

  // ✅ Toggle Copilot (persist)
  const [copilotOpen, setCopilotOpen] = useState<boolean>(true);
  useEffect(() => {
    try {
      const v = typeof window !== "undefined" ? window.localStorage.getItem(LS_COPILOT_OPEN) : null;
      if (v === "0") setCopilotOpen(false);
      if (v === "1") setCopilotOpen(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(LS_COPILOT_OPEN, copilotOpen ? "1" : "0");
    } catch {
      // ignore
    }
  }, [copilotOpen]);

  // refs to avoid loops & stale values
  const layersRef = useRef<LayerData[] | undefined>(undefined);
  const uiRef = useRef<any>(undefined);
  const dirtyRef = useRef(false);

  const lastUiSigRef = useRef<string>("");
  const lastLayersSigRef = useRef<string>("");

  const markDirty = useCallback(() => {
    if (dirtyRef.current) return;
    dirtyRef.current = true;
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  // ✅ restore draft local (si existe)
  useEffect(() => {
    const parsed = safeJsonParse(localStorage.getItem(LS_POST));
    if (!parsed) return;

    if (parsed?.layers && Array.isArray(parsed.layers)) {
      setDraftLayers(parsed.layers);
      layersRef.current = parsed.layers;
      lastLayersSigRef.current = JSON.stringify(parsed.layers);
    }
    if (parsed?.ui) {
      setDraftUI(parsed.ui);
      uiRef.current = parsed.ui;
      lastUiSigRef.current = JSON.stringify(parsed.ui);
    }
  }, []);

  // ✅ persist local (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_POST,
          JSON.stringify({
            ui: uiRef.current ?? draftUI,
            layers: layersRef.current ?? draftLayers ?? [],
          })
        );
      } catch {
        // no-op
      }
    }, 250);

    return () => clearTimeout(t);
  }, [draftUI, draftLayers]);

  const initialLayersKey = useMemo(() => "post", []);

  const handleUIChange = useCallback(
    (ui: any) => {
      const cleaned = stripNonSerializableUI(ui ?? {});
      const sig = stableSig(cleaned ?? {});

      if (sig === lastUiSigRef.current) return;

      lastUiSigRef.current = sig;
      uiRef.current = cleaned;

      setDraftUI((prev: any) => (stableSig(prev ?? {}) === sig ? prev : cleaned));
      markDirty();

      onSnapshot?.({
        ui: cleaned,
        layers: layersRef.current ?? [],
      });
    },
    [markDirty, onSnapshot]
  );

  const handleLayersChange = useCallback(
    (layers: LayerData[]) => {
      const sig = stableSig(layers ?? []);
      if (sig === lastLayersSigRef.current) return;

      lastLayersSigRef.current = sig;
      layersRef.current = layers;

      setDraftLayers((prev) => (stableSig(prev ?? []) === sig ? prev : layers));
      markDirty();

      onSnapshot?.({
        ui: uiRef.current,
        layers,
      });
    },
    [markDirty, onSnapshot]
  );

  /** =========================
   *  IA Copilot UI state
   *  ========================= */
  const textLayers = useMemo(() => {
    return (draftLayers ?? []).filter((l: any) => l?.type === "text");
  }, [draftLayers]);

  const defaultTargetId = useMemo(() => {
    const anyText = textLayers as any[];
    const byMain = anyText.find((l) => String(l?.id || "").includes("text-main"));
    return (byMain?.id ?? anyText[0]?.id ?? "") as string;
  }, [textLayers]);

  const [targetLayerId, setTargetLayerId] = useState<string>("");
  useEffect(() => {
    if (!targetLayerId && defaultTargetId) setTargetLayerId(defaultTargetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTargetId]);

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

  // ✅ Coach injection guards (non-destructif)
  const userTouchedIdeaRef = useRef(false);
  const userTouchedObjectiveRef = useRef(false);
  const userTouchedAngleRef = useRef(false);
  const lastInjectedBriefSigRef = useRef<string>("");

  // ✅ Brief banner (and injection) — once per session unless user edits
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
    return (draftLayers ?? []).find((l: any) => String(l?.id) === String(targetLayerId)) as any;
  }, [draftLayers, targetLayerId]);

  // ✅ IMPORTANT: synchroniser la sélection du layer dans l'UI de l'éditeur
  // pour que les propriétés (dont la couleur) s'appliquent bien au layer cible.
  const syncEditorSelection = useCallback(
    (id: string) => {
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
        // clés courantes possibles (selon versions)
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
    },
    [handleUIChange]
  );

  useEffect(() => {
    if (targetLayerId) syncEditorSelection(targetLayerId);
  }, [targetLayerId, syncEditorSelection]);

  const applyToLayer = useCallback(
    (text: string) => {
      if (!text || !draftLayers || draftLayers.length === 0) return;
      const id = targetLayerId || defaultTargetId;
      if (!id) return;

      const next = draftLayers.map((l: any) => {
        if (String(l?.id) !== String(id)) return l;
        if (l?.type !== "text") return l;
        return { ...l, text };
      });

      handleLayersChange(next as any);
      // keep selection in sync after apply (so color picker, etc. stays on the right layer)
      syncEditorSelection(id);
    },
    [draftLayers, targetLayerId, defaultTargetId, handleLayersChange, syncEditorSelection]
  );

  function buildContext() {
    const base = [
      "Tu es LGD Copilot : spécialiste du marketing digital, produits digitaux, formation, MRR (Master Resell Rights).",
      "Tu écris pour fédérer sur les réseaux sociaux et convertir vers une offre MRR / formation.",
      "Tu évites le blabla et les généralités : concret, actionnable, orienté résultats.",
      "Tu utilises un français naturel, impactant, crédible, et tu restes dans la niche marketing digital.",
      `Réseau: ${network}. Objectif: ${objective}. Angle: ${angle}.`,
    ].join("\n");
    const b = (brief || "").trim();
    if (!b) return base;
    return [base, "---", "Brief du coach (à respecter):", b].join("\n");
  }

  async function runCopilot(task: "hooks" | "caption" | "cta" | "hashtags" | "ab" | "rewrite") {
    setAiError(null);
    setAiLoading(true);

    try {
      const currentText = String((targetLayer as any)?.text ?? "").trim();
      const topic = (idea || "").trim() || currentText || "marketing digital / produits digitaux / MRR";

      const ctx = buildContext();
      let prompt = "";

      if (task === "hooks") {
        prompt = [
          ctx,
          "Génère 10 hooks ULTRA accrocheurs, courts, dédiés au marketing digital et MRR.",
          "Format STRICT : une liste numérotée 1 à 10, une seule ligne par hook. Pas d'explication.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "caption") {
        prompt = [
          ctx,
          "Écris une caption prête à poster (format paragraphe + bullets si utile).",
          "Inclure : Hook (1ère ligne), Valeur, Mini-structure, puis CTA orienté MRR (DM mot-clé).",
          "Pas de hashtags ici.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "cta") {
        prompt = [
          ctx,
          "Propose 5 CTA orientés conversion MRR (DM mot-clé / commentaire mot-clé / lien en bio).",
          "Format STRICT : une liste à puces, 1 CTA par ligne. Pas d'explication.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "hashtags") {
        prompt = [
          ctx,
          "Génère 20 hashtags pertinents pour le sujet, en français + quelques EN si utile.",
          "Format STRICT : une seule ligne, hashtags séparés par des espaces. Pas d'explication.",
          `Sujet: ${topic}`,
        ].join("\n");
      } else if (task === "ab") {
        prompt = [
          ctx,
          "Crée 2 versions (A et B) d'une caption prête à poster.",
          "A = style très direct / conversion. B = storytelling crédible.",
          "Format STRICT :",
          "A: <texte>",
          "B: <texte>",
          `Sujet: ${topic}`,
        ].join("\n");
      } else {
        // rewrite
        prompt = [
          ctx,
          "Réécris et améliore ce texte pour le rendre plus clair, plus persuasif et orienté MRR.",
          "Ne renvoie QUE le texte final.",
          `TEXTE:\n${currentText || topic}`,
        ].join("\n");
      }

      const out = await aiRewriteText({
        text: prompt,
        tone: tone?.trim() ? tone.trim() : undefined,
        max_length: maxChars > 0 ? maxChars : undefined,
      });

      // Parse hooks if needed
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

  const copilotDisabled = !apiBase();

  // ✅ Coach brief → Copilot injection (subject + objective + angle + auto-first-caption)
  useEffect(() => {
    const b = (brief || "").trim();
    if (!b) return;

    const sig = normalizeBriefSig(b);

    // 1) Pré-remplir le sujet / idée (non-destructif)
    if (!userTouchedIdeaRef.current) {
      setIdea((prev) => (prev && prev.trim().length > 0 ? prev : b));
    }

    // 2) Objectif & Angle auto (non-destructif)
    if (!userTouchedObjectiveRef.current) {
      const inferredObj = inferObjectiveFromBrief(b);
      setObjective((prev) => (userTouchedObjectiveRef.current ? prev : inferredObj));
    }

    if (!userTouchedAngleRef.current) {
      const inferredAngle = inferAngleFromBrief(b);
      setAngle((prev) => (userTouchedAngleRef.current ? prev : inferredAngle));
    }

    // 3) Auto-génération (caption) une seule fois par brief (si API dispo)
    if (copilotDisabled) return;
    if (aiLoading) return;

    // anti-loop: une seule fois par brief
    if (lastInjectedBriefSigRef.current === sig) return;

    // si l'utilisateur a déjà un output, ne force pas (évite de surprendre)
    if (aiOutput && aiOutput.trim().length > 0) {
      lastInjectedBriefSigRef.current = sig;
      return;
    }

    lastInjectedBriefSigRef.current = sig;

    // run async, sans modifier la logique IA existante
    // (le brief est déjà injecté dans le contexte via buildContext())
    setTimeout(() => {
      runCopilot("caption").catch(() => {
        // runCopilot gère déjà l'erreur
      });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief]);

  const plannerTitle = useMemo(() => {
    const firstText = textLayers
      .map((layer: any) => String(layer?.text || "").trim())
      .find(Boolean);
    return clip(firstText || idea || brief || "Post intelligent LGD", 72);
  }, [textLayers, idea, brief]);

  const handleScheduleConfirm = useCallback(
    async ({ reseau, date_programmee, titre }: { reseau: string; date_programmee: string; titre?: string }) => {
      let preview_image = "";
      try {
        preview_image = await renderEditorCreationToDataUrl({
          mode: "post",
          draft: {
            ui: draftUI,
            layers: draftLayers,
          },
        });
      } catch (error) {
        console.error("LGD planner snapshot post error:", error);
      }

      await schedule({
        reseau,
        date_programmee,
        titre: titre || plannerTitle,
        format: "post",
        contenu: {
          title: titre || plannerTitle,
          type: "post",
          layers: draftLayers,
          ui: draftUI,
          brief: brief || "",
          preview_image,
          planner_preview_image: preview_image,
        },
      });
      setScheduleOpen(false);
      if (typeof window !== "undefined") window.alert("✅ Ajouté au Planner !");
    },
    [schedule, plannerTitle, draftLayers, draftUI, brief]
  );

  return (
    <div className="w-full flex justify-center pt-[110px] pb-20">
      {/* ================= CANVAS XL WRAPPER ================= */}
      <div className="w-full max-w-[1600px] px-6">
        <div
          className="rounded-3xl p-8"
          style={{
            backgroundColor: "#262626",
            border: "1px solid rgba(255,184,0,0.25)",
          }}
        >
          {/* ================= COACH BRIEF (injected) ================= */}
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

          {/* ================= IA COPILOT (POST 1:1) ================= */}
          <div
            className="mb-6 rounded-3xl p-5"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,184,0,0.18)",
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <div className="text-yellow-200 font-semibold text-lg">Copilot IA — Post 1:1 (Marketing digital • MRR)</div>
                <div className="text-white/60 text-sm">
                  Génère hooks, caption, CTA et variantes orientés produits digitaux & Master Resell Rights. (texte-only, safe)
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCopilotOpen((v) => !v)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold border border-yellow-500/25 bg-black/30 text-yellow-200 hover:bg-black/45"
                >
                  {copilotOpen ? "▾ Masquer l’IA" : "▸ Afficher l’IA"}
                </button>

                <button
                  onClick={() => runCopilot("hooks")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Hooks x10
                </button>
                <button
                  onClick={() => runCopilot("caption")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Caption prête
                </button>
                <button
                  onClick={() => runCopilot("cta")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  CTA
                </button>
                <button
                  onClick={() => runCopilot("hashtags")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Hashtags
                </button>
                <button
                  onClick={() => runCopilot("ab")}
                  disabled={aiLoading || copilotDisabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-black bg-[#ffb800] hover:brightness-110 disabled:opacity-60"
                >
                  Variantes A/B
                </button>
              </div>
            </div>

            {copilotOpen && (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4">
                  <label className="block text-yellow-300 text-xs mb-2">Sujet / idée (optionnel)</label>
                  <input
                    value={idea}
                    onChange={(e) => {
                      userTouchedIdeaRef.current = true;
                      setIdea(e.target.value);
                    }}
                    placeholder="Ex : vendre une formation MRR sans audience…"
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
                      <div className="mt-1 text-[11px] text-white/45">0 = auto. (approx. caractères, pas mots)</div>
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
                    <label className="block text-yellow-300 text-xs mb-2">Appliquer sur le layer texte</label>
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
                      <div className="text-[11px] text-white/45">
                        Pour changer la <span className="text-yellow-200">couleur</span>, clique ce bouton puis utilise le panneau Propriétés.
                      </div>
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

                    {copilotDisabled ? (
                      <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 text-sm">
                        NEXT_PUBLIC_API_URL manquant côté frontend.
                      </div>
                    ) : null}

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
                            LGD prépare une proposition premium à injecter dans ton post.
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {!aiLoading && aiHooks.length > 0 ? (
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
                            <div className="text-[11px] text-white/45 mb-1">Hook {idx + 1}</div>
                            <div className="text-sm font-semibold">{h}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={aiOutput}
                        onChange={(e) => setAiOutput(e.target.value)}
                        placeholder="Les résultats IA apparaîtront ici…"
                        rows={10}
                        className="mt-3 w-full rounded-2xl bg-black/40 border border-yellow-500/15 px-4 py-3 text-yellow-100 outline-none"
                      />
                    )}

                    <div className="mt-3 text-[11px] text-white/45">
                      Note : l’IA est volontairement spécialisée “marketing digital / produits digitaux / MRR”. Si tu sors du scope, elle recadre.
                    </div>
                  </div>

                  {targetLayer ? (
                    <div className="mt-3 text-[11px] text-white/45">
                      Layer cible actuel : <span className="text-yellow-200">{String((targetLayer as any)?.id || "")}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* ================= EDITOR ================= */}
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              disabled={scheduleLoading}
              className="rounded-xl border border-yellow-500/25 bg-[#ffb800] px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
            >
              {scheduleLoading ? "Planification..." : "Planifier"}
            </button>
          </div>

          <div className="w-full min-h-[820px] flex justify-center">
            <EditorLayout
              initialLayersKey={initialLayersKey}
              initialLayers={draftLayers}
              initialUI={draftUI}
              onUIChange={handleUIChange}
              onChange={handleLayersChange}
              mobileToolsOpen={mobileToolsOpen}
              onCloseMobileTools={onCloseMobileTools}
            />
          </div>

          <SchedulePlannerModal
            open={scheduleOpen}
            loading={scheduleLoading}
            defaultTitle={plannerTitle}
            onClose={() => setScheduleOpen(false)}
            onConfirm={handleScheduleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
