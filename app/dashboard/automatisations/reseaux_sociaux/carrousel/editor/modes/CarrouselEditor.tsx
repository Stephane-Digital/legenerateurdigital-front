"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerData } from "../v5/types/layers";
import EditorLayout from "../v5/ui/EditorLayout";

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

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
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

function clip(s: string, n = 46) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

function ensureSlide(slides: SlideDraft[] | null | undefined): SlideDraft[] {
  if (slides && Array.isArray(slides) && slides.length > 0) return slides;
  return [{ id: cryptoId("slide"), layers: [] }];
}

function cryptoId(prefix = "id") {
  const r = Math.random().toString(16).slice(2);
  return `${prefix}-${Date.now()}-${r}`;
}

function extractTextFromLayers(layers: LayerData[]) {
  return (layers || [])
    .filter((l: any) => l?.type === "text")
    .map((l: any) => String(l?.text ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

export default function CarrouselEditor({ mobileToolsOpen, onCloseMobileTools, brief }: Props) {
  /** =========================
   *  Draft state (localStorage)
   *  ========================= */
  const [slides, setSlides] = useState<SlideDraft[]>(() => {
    const parsed = safeJsonParse(
      typeof window !== "undefined" ? window.localStorage.getItem(LS_CARROUSEL) : null
    );

    // Draft can be stored as { ui, layers } for single-canvas OR as { slides }.
    if (parsed?.slides && Array.isArray(parsed.slides)) {
      return ensureSlide(parsed.slides);
    }

    // Backward compat: if draft has layers only, convert to one slide.
    if (parsed?.layers && Array.isArray(parsed.layers)) {
      return ensureSlide([{ id: cryptoId("slide"), layers: parsed.layers }]);
    }

    return ensureSlide(null);
  });

  const [activeSlideId, setActiveSlideId] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(LS_CARROUSEL_ACTIVE_SLIDE) : null;
    return saved || "";
  });

  // Persist active slide id
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeSlideId) window.localStorage.setItem(LS_CARROUSEL_ACTIVE_SLIDE, activeSlideId);
  }, [activeSlideId]);

  // Ensure activeSlideId is always valid
  useEffect(() => {
    if (!slides.length) return;
    if (!activeSlideId) {
      setActiveSlideId(slides[0].id);
      return;
    }
    const exists = slides.some((s) => s.id === activeSlideId);
    if (!exists) setActiveSlideId(slides[0].id);
  }, [slides, activeSlideId]);

  // Persist slides draft
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const existing = safeJsonParse(window.localStorage.getItem(LS_CARROUSEL)) || {};
      window.localStorage.setItem(
        LS_CARROUSEL,
        JSON.stringify({
          ...existing,
          slides,
        })
      );
    } catch {
      // no-op
    }
  }, [slides]);

  const activeSlide = useMemo(() => slides.find((s) => s.id === activeSlideId) || slides[0], [slides, activeSlideId]);

  /** =========================
   *  Update slide layers
   *  ========================= */
  const updateLayers = useCallback(
    (layers: LayerData[]) => {
      setSlides((prev) =>
        prev.map((s) => (s.id === activeSlide.id ? { ...s, layers: layers ?? [] } : s))
      );
    },
    [activeSlide.id]
  );

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

  /** =========================
   *  IA Copilot UI state
   *  ========================= */
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

  // Inject brief into the copilot idea field by default (non-destructive)
  useEffect(() => {
    const b = (brief || "").trim();
    if (!b) return;
    setIdea((prev) => (prev && prev.trim().length > 0 ? prev : b));
  }, [brief]);

  // ✅ Brief banner (and injection)
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
      if (!id) return;

      const layers = activeSlide?.layers ?? [];
      if (!layers.length) return;

      const next = layers.map((l: any) => {
        if (String(l?.id) !== String(id)) return l;
        if (l?.type !== "text") return l;
        return { ...l, text };
      });

      updateLayers(next as any);
    },
    [activeSlide?.layers, targetLayerId, defaultTargetId, updateLayers]
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
        // rewrite
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

  /** =========================
   *  Copilot toggle (collapsible)
   *  ========================= */
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

  /** =========================
   *  IA AUDIT (Slide active)
   *  ========================= */
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
      {/* ================= COACH BRIEF (injected) ================= */}
      {!briefDismissed && (brief || "").trim() ? (
        <div className="mb-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-yellow-200 font-semibold">Brief reçu du Coach Alex V2</div>
              <div className="mt-1 text-sm text-yellow-100/80 whitespace-pre-wrap">{(brief || "").trim()}</div>
              <div className="mt-2 text-[11px] text-white/55">
                ✅ Injecté automatiquement dans le Copilot (champ “Sujet / idée” + contexte).
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

      {/* ===== AUDIT IA (slide active) ===== */}
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

      {/* ===== COPILOT (collapsible) ===== */}
      <div className="mb-6 rounded-3xl border border-yellow-500/15 bg-black/30">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <div className="text-yellow-200 font-semibold">Copilot IA — Carrousel (Marketing digital • MRR)</div>
            <div className="text-white/55 text-sm">
              Slide active uniquement • texte-only • hooks/valeur/CTA (safe)
            </div>
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
                  onChange={(e) => setIdea(e.target.value)}
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
                      onChange={(e) => setObjective(e.target.value as Objective)}
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
                      onChange={(e) => setAngle(e.target.value as Angle)}
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
                      {aiError}
                    </div>
                  ) : null}

                  {aiLoading ? <div className="mt-3 text-white/60 text-sm">Génération IA en cours…</div> : null}

                  {aiHooks.length > 0 ? (
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

      <EditorLayout
        initialLayers={activeSlide.layers}
        initialLayersKey={activeSlideId} // ✅ force re-init propre par slide
        onChange={updateLayers}
        mobileToolsOpen={mobileToolsOpen}
        onCloseMobileTools={onCloseMobileTools}
      />

      {/* Bottom slides bar (design inchangé) */}
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
