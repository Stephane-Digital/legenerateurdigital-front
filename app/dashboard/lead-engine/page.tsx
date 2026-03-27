"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaCopy, FaMagic, FaRedo } from "react-icons/fa";

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import LeadEditorLayout from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/ui/LeadEditorLayout";
import { buildLeadHtmlExport } from "@/dashboard/lead-engine/utils/exportHtml";

const STORAGE_KEY = "lgd_lead_engine_builder_v4";
const STORAGE_CTA_KEY = "lgd_lead_engine_builder_v4_cta_url";
const STORAGE_CANVAS_HEIGHT_KEY = "lgd_lead_engine_builder_v4_canvas_height";

function buildLeadPreset(): LayerData[] {
  return [
    {
      id: "lead-title",
      type: "text",
      x: 74,
      y: 86,
      width: 560,
      height: 220,
      visible: true,
      selected: false,
      zIndex: 2,
      text: "Comment générer tes premiers leads qualifiés en 7 jours",
      style: {
        fontSize: 60,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.04,
      },
    } as LayerData,
    {
      id: "lead-subtitle",
      type: "text",
      x: 78,
      y: 320,
      width: 530,
      height: 136,
      visible: true,
      selected: false,
      zIndex: 3,
      text: "Une landing premium pensée pour transformer ton audience en vrais prospects sans dépendre uniquement des algorithmes.",
      style: {
        fontSize: 24,
        fontFamily: "Inter",
        color: "#e4e4e7",
        fontWeight: 500,
        lineHeight: 1.45,
      },
    } as LayerData,
    {
      id: "lead-cta",
      type: "text",
      x: 78,
      y: 474,
      width: 330,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 4,
      text: "Recevoir la méthode maintenant",
      style: {
        fontSize: 22,
        fontFamily: "Inter",
        color: "#111111",
        fontWeight: 800,
        lineHeight: 1.2,
        backgroundColor: "#ffb800",
      },
    } as LayerData,
    {
      id: "lead-benefits-title",
      type: "text",
      x: 74,
      y: 620,
      width: 240,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 5,
      text: "Bénéfices",
      style: {
        fontSize: 34,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-benefit-1",
      type: "text",
      x: 78,
      y: 688,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 6,
      text: "• Attire des prospects plus qualifiés sans complexifier ton marketing.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-benefit-2",
      type: "text",
      x: 78,
      y: 754,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 7,
      text: "• Transforme tes contenus en machine à leads plus cohérente.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-benefit-3",
      type: "text",
      x: 78,
      y: 820,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 8,
      text: "• Crée une structure premium qui donne envie de s’inscrire.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-proof-title",
      type: "text",
      x: 74,
      y: 960,
      width: 340,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 9,
      text: "Preuve sociale",
      style: {
        fontSize: 34,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-proof-body",
      type: "text",
      x: 78,
      y: 1028,
      width: 860,
      height: 92,
      visible: true,
      selected: false,
      zIndex: 10,
      text: "Cette structure aide à capter plus facilement des leads réellement intéressés par ton offre.",
      style: {
        fontSize: 24,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.4,
      },
    } as LayerData,
    {
      id: "lead-faq-title",
      type: "text",
      x: 74,
      y: 1188,
      width: 220,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 11,
      text: "FAQ",
      style: {
        fontSize: 34,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-faq-q1",
      type: "text",
      x: 78,
      y: 1256,
      width: 860,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 12,
      text: "Est-ce adapté aux débutants ?",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.2,
      },
    } as LayerData,
    {
      id: "lead-faq-a1",
      type: "text",
      x: 78,
      y: 1318,
      width: 860,
      height: 82,
      visible: true,
      selected: false,
      zIndex: 13,
      text: "Oui, la structure a été pensée pour rester simple à mettre en œuvre.",
      style: {
        fontSize: 22,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.38,
      },
    } as LayerData,
    {
      id: "lead-faq-q2",
      type: "text",
      x: 78,
      y: 1450,
      width: 860,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 14,
      text: "Combien de temps faut-il pour l’utiliser ?",
      style: {
        fontSize: 26,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.2,
      },
    } as LayerData,
    {
      id: "lead-faq-a2",
      type: "text",
      x: 78,
      y: 1512,
      width: 860,
      height: 82,
      visible: true,
      selected: false,
      zIndex: 15,
      text: "Le format est conçu pour être actionnable rapidement, sans lecture interminable.",
      style: {
        fontSize: 22,
        fontFamily: "Inter",
        color: "#d4d4d8",
        fontWeight: 500,
        lineHeight: 1.38,
      },
    } as LayerData,
  ];
}

function safeParseLayers(raw: string | null): LayerData[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LayerData[]) : null;
  } catch {
    return null;
  }
}

function safeParseHeight(raw: string | null): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(900, Math.min(4000, n));
}

function getBottom(layer: any) {
  const y = Number(layer?.y ?? 0);
  const h = Number(layer?.height ?? 0);
  return y + h;
}

function computeAutoCanvasHeight(layers: LayerData[]) {
  const visible = layers.filter((layer: any) => layer?.visible !== false);
  const maxBottom = visible.reduce((max, layer: any) => Math.max(max, getBottom(layer)), 0);
  return Math.max(900, Math.ceil(maxBottom + 140));
}

export default function LeadEnginePage() {
  const [editorKey, setEditorKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [initialLayers, setInitialLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [layers, setLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [ctaUrl, setCtaUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [canvasHeight, setCanvasHeight] = useState(1650);

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(window.localStorage.getItem(STORAGE_KEY));
      const savedCta = window.localStorage.getItem(STORAGE_CTA_KEY) || "";
      const savedCanvasHeight = safeParseHeight(
        window.localStorage.getItem(STORAGE_CANVAS_HEIGHT_KEY)
      );

      const nextLayers =
        savedLayers && savedLayers.length > 0 ? savedLayers : buildLeadPreset();

      const nextHeight = savedCanvasHeight ?? computeAutoCanvasHeight(nextLayers);

      setInitialLayers(nextLayers);
      setLayers(nextLayers);
      setCtaUrl(savedCta);
      setCanvasHeight(nextHeight);
    } catch {
      const preset = buildLeadPreset();
      setInitialLayers(preset);
      setLayers(preset);
      setCtaUrl("");
      setCanvasHeight(computeAutoCanvasHeight(preset));
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, ctaUrl);
    } catch {
      // noop
    }
  }, [ctaUrl, hydrated]);

  const htmlExport = useMemo(() => {
    return buildLeadHtmlExport({
      layers,
      ctaUrl,
    });
  }, [layers, ctaUrl]);

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(htmlExport);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }

  function persistWorkingState(nextLayers: LayerData[], nextHeight: number) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayers));
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(nextHeight));
    } catch {
      // noop
    }
  }

  function handleLayersChange(nextLayers: LayerData[]) {
    const nextHeight = computeAutoCanvasHeight(nextLayers);

    setLayers(nextLayers);
    setInitialLayers(nextLayers);
    setCanvasHeight(nextHeight);
    setLastSavedAt(new Date().toLocaleTimeString());

    persistWorkingState(nextLayers, nextHeight);
  }

  function resetPreset() {
    const preset = buildLeadPreset();
    const nextHeight = computeAutoCanvasHeight(preset);

    setInitialLayers(preset);
    setLayers(preset);
    setCanvasHeight(nextHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    persistWorkingState(preset, nextHeight);
  }

  function applyAutoHeightCanvas() {
    const nextHeight = computeAutoCanvasHeight(layers);

    setCanvasHeight(nextHeight);
    setLastSavedAt(new Date().toLocaleTimeString());

    try {
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(nextHeight));
    } catch {
      // noop
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1800px] px-6 pb-10 pt-[110px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-200"
              >
                <FaArrowLeft />
                Retour Dashboard
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                <FaMagic className="text-yellow-300" />
                Lead Builder V4.2.3 — Auto Height Canvas
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[#ffb800] sm:text-4xl">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Le bloc central ajuste maintenant automatiquement sa hauteur selon le
              contenu réel de la landing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyHtml}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
            >
              <FaCopy className="text-yellow-300" />
              {copied ? "HTML copié" : "Exporter HTML SIO"}
            </button>

            <button
              type="button"
              onClick={resetPreset}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
            >
              <FaRedo className="text-yellow-300" />
              Réinitialiser le preset
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_0.85fr]">
            <div>
              <div className="mb-2 text-sm font-semibold text-yellow-300">
                Champ CTA Systeme.io
              </div>
              <div className="text-sm text-white/55">
                Ce champ pilote le lien du bouton exporté. Flux : champ ⇒ bouton HTML ⇒ page ou formulaire Systeme.io.
              </div>

              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://ton-lien-systeme.io/ton-formulaire"
                className="mt-4 w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/85 outline-none placeholder:text-white/30"
              />
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">
                Auto height canvas
              </div>

              <div className="mt-2 text-sm text-white/60">
                Le bloc central se recalibre selon le point bas du contenu visible.
              </div>

              <button
                type="button"
                onClick={applyAutoHeightCanvas}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-bold text-black"
              >
                Auto-ajuster la hauteur du canvas
              </button>
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">
                Vérification
              </div>

              <div className="mt-3 space-y-2 text-sm text-white/70">
                <div>
                  <span className="font-semibold text-white/90">Hauteur actuelle :</span>{" "}
                  {canvasHeight}px
                </div>
                <div>
                  <span className="font-semibold text-white/90">Dernière synchro :</span>{" "}
                  {lastSavedAt || "en attente d’une modification"}
                </div>
                <div>
                  <span className="font-semibold text-white/90">Texte du bouton :</span>{" "}
                  layer <code className="text-yellow-300">lead-cta</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-4 sm:p-5">
          {hydrated ? (
            <LeadEditorLayout
              key={editorKey}
              initialLayers={initialLayers}
              initialLayersKey={`lead-engine-${editorKey}`}
              canvasHeight={canvasHeight}
              onChange={handleLayersChange}
            />
          ) : (
            <div className="flex min-h-[680px] items-center justify-center rounded-[20px] border border-yellow-600/15 bg-[#090909] text-sm text-white/45">
              Chargement du lead builder...
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-yellow-300">
                HTML SIO généré
              </div>
              <div className="mt-1 text-sm text-white/55">
                Le bouton exporté reprend le texte du layer et le lien du champ CTA.
              </div>
            </div>

            <button
              type="button"
              onClick={copyHtml}
              className="rounded-2xl bg-[#ffb800] px-5 py-3 font-semibold text-black"
            >
              {copied ? "Copié" : "Copier le HTML"}
            </button>
          </div>

          <textarea
            readOnly
            value={htmlExport}
            className="mt-4 min-h-[320px] w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/80 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
